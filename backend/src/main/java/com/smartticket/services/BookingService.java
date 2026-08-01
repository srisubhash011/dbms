package com.smartticket.services;

import com.smartticket.concurrency.DeadlockHandler;
import com.smartticket.concurrency.OCCManager;
import com.smartticket.concurrency.RetryManager;
import com.smartticket.concurrency.TimeoutHandler;
import com.smartticket.dto.BookingRequest;
import com.smartticket.dto.BookingResponse;
import com.smartticket.exception.BookingException;
import com.smartticket.exception.SeatAlreadyBookedException;
import com.smartticket.model.*;
import com.smartticket.repository.*;
import com.smartticket.utils.LoggerUtil;
import com.smartticket.utils.TransactionIdGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final LogRepository logRepository;

    private final RetryManager retryManager;
    private final OCCManager occManager;
    private final TimeoutHandler timeoutHandler;
    private final DeadlockHandler deadlockHandler;

    public BookingResponse bookTicket(BookingRequest request) {
        long startTime = System.currentTimeMillis();
        String threadName = Thread.currentThread().getName();
        int attempts = 0;
        Exception lastException = null;

        Long userId = request.getUserId() != null ? request.getUserId() : 1L; // Fallback demo user

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
                    logFailedAttempt(request, threadName, startTime, attempts, "OCC_CONFLICT_MAX_RETRIES", "Maximum OCC retries exceeded for seat " + request.getSeatNumber());
                    throw new SeatAlreadyBookedException("Seat Already Booked. Retrying... Attempt 1, Attempt 2, Attempt 3 failed due to concurrent lock.");
                }
            } catch (SeatAlreadyBookedException ex) {
                logFailedAttempt(request, threadName, startTime, attempts, "SEAT_ALREADY_BOOKED", ex.getMessage());
                throw ex;
            } catch (Exception ex) {
                lastException = ex;
                if (occManager.isVersionConflict(ex)) {
                    if (attempts <= retryManager.getMaxRetries()) {
                        long backoffMs = retryManager.calculateBackoffDelay(attempts);
                        retryManager.executeBackoff(attempts);
                    } else {
                        logFailedAttempt(request, threadName, startTime, attempts, "OCC_CONFLICT", ex.getMessage());
                        throw new SeatAlreadyBookedException("Seat Already Booked. Max retries exceeded.");
                    }
                } else {
                    logFailedAttempt(request, threadName, startTime, attempts, "ERROR", ex.getMessage());
                    throw new BookingException("Booking failed: " + ex.getMessage(), ex);
                }
            } finally {
                deadlockHandler.releaseLockAttempt(threadName, "seat:" + request.getEventId());
            }
        }

        logFailedAttempt(request, threadName, startTime, attempts, "FAILED", "Failed after " + attempts + " retries");
        throw new BookingException("Booking transaction failed after multiple retries", lastException);
    }

    @Transactional
    public BookingResponse executeSingleBookingTransaction(BookingRequest request, Long userId, String threadName, int attempt, long startTimeMs) {
        Seat seat;
        if (request.getSeatId() != null) {
            seat = seatRepository.findById(request.getSeatId())
                    .orElseThrow(() -> new BookingException("Seat not found with ID: " + request.getSeatId()));
        } else if (request.getSeatNumber() != null && request.getEventId() != null) {
            seat = seatRepository.findByEventIdAndSeatNumber(request.getEventId(), request.getSeatNumber())
                    .orElseThrow(() -> new BookingException("Seat " + request.getSeatNumber() + " not found for event"));
        } else {
            throw new BookingException("Invalid seat parameters provided");
        }

        // Concurrency Check: Is seat already booked?
        if (seat.getStatus() == Seat.SeatStatus.BOOKED) {
            throw new SeatAlreadyBookedException("Seat " + seat.getSeatNumber() + " is already booked by another transaction.");
        }

        User user = userRepository.findById(userId)
                .orElseGet(() -> userRepository.findAll().stream().findFirst()
                        .orElseGet(() -> userRepository.save(User.builder()
                                .name("Guest User")
                                .email("guest@smartticket.com")
                                .password("password")
                                .role(User.Role.ROLE_USER)
                                .build())));

        Event event = seat.getEvent();
        if (event.getAvailableSeats() <= 0) {
            throw new BookingException("No available seats left for this event.");
        }

        // Mutate status & decrement available seats (Triggers Hibernate @Version increment)
        seat.setStatus(Seat.SeatStatus.BOOKED);
        seatRepository.save(seat);

        event.setAvailableSeats(event.getAvailableSeats() - 1);
        eventRepository.save(event);

        String txnId = TransactionIdGenerator.generateTransactionId();

        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .seat(seat)
                .transactionId(txnId)
                .bookingTime(LocalDateTime.now())
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        long execTime = System.currentTimeMillis() - startTimeMs;

        // Save Transaction Log
        TransactionLog logEntry = TransactionLog.builder()
                .transactionId(txnId)
                .threadName(threadName)
                .bookingStart(LocalDateTime.now().minusNanos(execTime * 1000000))
                .bookingEnd(LocalDateTime.now())
                .executionTimeMs(execTime)
                .retryCount(attempt - 1)
                .status("SUCCESS")
                .remarks("Seat " + seat.getSeatNumber() + " successfully booked on attempt " + attempt)
                .build();
        logRepository.save(logEntry);

        LoggerUtil.logBookingAttempt(threadName, seat.getSeatNumber(), attempt, "SUCCESS");

        return BookingResponse.builder()
                .bookingId(savedBooking.getId())
                .transactionId(txnId)
                .eventTitle(event.getTitle())
                .venue(event.getVenue())
                .seatNumber(seat.getSeatNumber())
                .bookingTime(savedBooking.getBookingTime())
                .status("CONFIRMED")
                .retriesAttempted(attempt - 1)
                .executionTimeMs(execTime)
                .message("Booking confirmed successfully!")
                .build();
    }

    private void logFailedAttempt(BookingRequest request, String threadName, long startTime, int attempts, String status, String remarks) {
        long execTime = System.currentTimeMillis() - startTime;
        TransactionLog logEntry = TransactionLog.builder()
                .transactionId("FAILED-" + System.currentTimeMillis())
                .threadName(threadName)
                .bookingStart(LocalDateTime.now().minusNanos(execTime * 1000000))
                .bookingEnd(LocalDateTime.now())
                .executionTimeMs(execTime)
                .retryCount(attempts - 1)
                .status(status)
                .remarks(remarks)
                .build();
        logRepository.save(logEntry);
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByBookingTimeDesc(userId);
    }
}
