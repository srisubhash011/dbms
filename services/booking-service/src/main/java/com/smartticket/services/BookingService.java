package com.smartticket.services;

import com.smartticket.concurrency.DeadlockHandler;
import com.smartticket.concurrency.OCCManager;
import com.smartticket.concurrency.RetryManager;
import com.smartticket.concurrency.TimeoutHandler;
import com.smartticket.dto.*;
import com.smartticket.exception.BookingException;
import com.smartticket.exception.SeatAlreadyBookedException;
import com.smartticket.model.Booking;
import com.smartticket.repository.BookingDataRepository;
import com.smartticket.utils.LoggerUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingDataRepository bookingDataRepository;

    private final RetryManager retryManager;
    private final OCCManager occManager;
    private final TimeoutHandler timeoutHandler;
    private final DeadlockHandler deadlockHandler;

    private final RestTemplate restTemplate;
    private final RabbitTemplate rabbitTemplate;

    @Value("${service.instance.id:BOOKING-SERVICE-1}")
    private String instanceId;

    @Value("${seat.service.url:http://seat-service:8080}")
    private String seatServiceUrl;

    @Value("${rabbitmq.exchange:booking.events}")
    private String exchangeName;

    @Value("${rabbitmq.routingkey:booking.confirmed}")
    private String routingKey;

    public BookingResponse bookTicket(BookingRequest request) {
        long startTime = System.currentTimeMillis();
        String threadName = Thread.currentThread().getName();
        int attempts = 0;
        Exception lastException = null;

        Long userId = request.getUserId() != null ? request.getUserId() : 1L;

        while (attempts <= retryManager.getMaxRetries()) {
            attempts++;
            try {
                timeoutHandler.checkTimeout(startTime);
                deadlockHandler.registerLockAttempt(threadName, "seat:" + request.getEventId());

                BookingResponse response = executeSingleBookingTransaction(request, userId, threadName, attempts, startTime);

                deadlockHandler.releaseLockAttempt(threadName, "seat:" + request.getEventId());
                return response;

            } catch (ObjectOptimisticLockingFailureException ex) {
                lastException = ex;
                LoggerUtil.logConflict(threadName, request.getSeatNumber(), "JPA OCC @Version mismatch: " + ex.getMessage());

                if (attempts <= retryManager.getMaxRetries()) {
                    long backoffMs = retryManager.calculateBackoffDelay(attempts);
                    LoggerUtil.logRetryBackoff(threadName, attempts, backoffMs);
                    retryManager.executeBackoff(attempts);
                } else {
                    bookingDataRepository.saveFailedLog(request, threadName, startTime, attempts, "OCC_CONFLICT_MAX_RETRIES", "Maximum OCC retries exceeded for seat " + request.getSeatNumber());
                    throw new SeatAlreadyBookedException("Seat Already Booked. Retrying... Attempt 1, Attempt 2, Attempt 3 failed due to concurrent lock.");
                }
            } catch (SeatAlreadyBookedException ex) {
                bookingDataRepository.saveFailedLog(request, threadName, startTime, attempts, "SEAT_ALREADY_BOOKED", ex.getMessage());
                throw ex;
            } catch (Exception ex) {
                lastException = ex;
                if (occManager.isVersionConflict(ex)) {
                    if (attempts <= retryManager.getMaxRetries()) {
                        long backoffMs = retryManager.calculateBackoffDelay(attempts);
                        retryManager.executeBackoff(attempts);
                    } else {
                        bookingDataRepository.saveFailedLog(request, threadName, startTime, attempts, "OCC_CONFLICT", ex.getMessage());
                        throw new SeatAlreadyBookedException("Seat Already Booked. Max retries exceeded.");
                    }
                } else {
                    bookingDataRepository.saveFailedLog(request, threadName, startTime, attempts, "ERROR", ex.getMessage());
                    throw new BookingException("Booking failed: " + ex.getMessage(), ex);
                }
            } finally {
                deadlockHandler.releaseLockAttempt(threadName, "seat:" + request.getEventId());
            }
        }

        bookingDataRepository.saveFailedLog(request, threadName, startTime, attempts, "FAILED", "Failed after " + attempts + " retries");
        throw new BookingException("Booking transaction failed after multiple retries", lastException);
    }

    public BookingResponse executeSingleBookingTransaction(BookingRequest request, Long userId, String threadName, int attempt, long startTimeMs) {
        log.info("[{}] Requesting seat reservation from Seat Service at {}/api/seats/reserve", instanceId, seatServiceUrl);

        SeatReservationRequest reservationRequest = SeatReservationRequest.builder()
                .eventId(request.getEventId())
                .seatId(request.getSeatId())
                .seatNumber(request.getSeatNumber())
                .userId(userId)
                .build();

        SeatReservationResponse seatResponse;
        try {
            ResponseEntity<SeatReservationResponse> responseEntity = restTemplate.postForEntity(
                    seatServiceUrl + "/api/seats/reserve", reservationRequest, SeatReservationResponse.class);
            seatResponse = responseEntity.getBody();
        } catch (Exception ex) {
            log.error("[{}] Seat Service reservation failed: {}", instanceId, ex.getMessage());
            if (ex.getMessage() != null && ex.getMessage().contains("already booked")) {
                throw new SeatAlreadyBookedException("Seat is already booked by another user.");
            }
            throw new BookingException("Failed to reserve seat via Seat Service: " + ex.getMessage(), ex);
        }

        if (seatResponse == null || !seatResponse.isSuccess()) {
            throw new SeatAlreadyBookedException(seatResponse != null ? seatResponse.getMessage() : "Seat reservation failed");
        }

        Booking savedBooking = bookingDataRepository.saveBooking(seatResponse, userId, threadName, attempt, startTimeMs);

        // Asynchronous Messaging: Publish event to RabbitMQ
        try {
            BookingEvent bookingEvent = BookingEvent.builder()
                    .bookingId("B" + savedBooking.getId())
                    .transactionId(savedBooking.getTransactionId())
                    .userId(savedBooking.getUser().getId())
                    .userEmail(savedBooking.getUser().getEmail())
                    .eventId(savedBooking.getEvent().getId())
                    .eventTitle(savedBooking.getEvent().getTitle())
                    .seatNumber(seatResponse.getSeatNumber())
                    .price(seatResponse.getPrice())
                    .status("CONFIRMED")
                    .timestamp(LocalDateTime.now())
                    .processedByInstance(instanceId)
                    .build();

            rabbitTemplate.convertAndSend(exchangeName, routingKey, bookingEvent);
            log.info("[{}] Published BookingConfirmed event to RabbitMQ exchange '{}' (Booking ID: {})", instanceId, exchangeName, savedBooking.getId());
        } catch (Exception ex) {
            log.error("[{}] Non-blocking warning: Failed to publish RabbitMQ event: {}", instanceId, ex.getMessage());
        }

        return BookingResponse.builder()
                .bookingId(savedBooking.getId())
                .transactionId(savedBooking.getTransactionId())
                .eventTitle(savedBooking.getEvent().getTitle())
                .venue(savedBooking.getEvent().getVenue())
                .seatNumber(seatResponse.getSeatNumber())
                .bookingTime(savedBooking.getBookingTime())
                .status("CONFIRMED")
                .retriesAttempted(attempt - 1)
                .executionTimeMs(System.currentTimeMillis() - startTimeMs)
                .message("Booking confirmed by " + instanceId)
                .build();
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingDataRepository.findUserBookings(userId);
    }

    public Booking getBookingById(Long id) {
        return bookingDataRepository.findBookingById(id);
    }

    public String getCacheMetrics() {
        return bookingDataRepository.getCacheMetrics();
    }
}
