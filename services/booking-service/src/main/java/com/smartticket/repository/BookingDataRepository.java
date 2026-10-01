package com.smartticket.repository;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.smartticket.dto.BookingResponse;
import com.smartticket.dto.SeatReservationResponse;
import com.smartticket.exception.BookingException;
import com.smartticket.model.*;
import com.smartticket.utils.TransactionIdGenerator;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Repository
@RequiredArgsConstructor
public class BookingDataRepository {

    private static final Logger log = LoggerFactory.getLogger(BookingDataRepository.class);

    private final BookingRepository bookingJpaRepository;
    private final UserRepository userJpaRepository;
    private final EventRepository eventJpaRepository;
    private final SeatRepository seatJpaRepository;
    private final LogRepository logJpaRepository;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Value("${service.instance.id:BOOKING-SERVICE-1}")
    private String instanceId;

    private static final String BOOKING_CACHE_PREFIX = "booking:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(15);

    private long cacheHits = 0;
    private long cacheMisses = 0;
    private long redisFailures = 0;
    private long dbFallbacks = 0;

    public Booking findBookingById(Long id) {
        String cacheKey = BOOKING_CACHE_PREFIX + id;
        try {
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);
            if (cachedJson != null) {
                cacheHits++;
                log.info("[REDIS] Cache HIT booking id={}", id);
                return objectMapper.readValue(cachedJson, Booking.class);
            } else {
                cacheMisses++;
                log.info("[REDIS] Cache MISS booking id={}", id);
            }
        } catch (Exception e) {
            redisFailures++;
            dbFallbacks++;
            log.warn("[REDIS] Redis unavailable when reading booking id={}: {}. Fallback to MySQL.", id, e.getMessage());
        }

        // MySQL Fallback
        Booking booking = bookingJpaRepository.findById(id)
                .orElseThrow(() -> new BookingException("Booking not found with ID: " + id));

        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(booking), CACHE_TTL);
            log.info("[REDIS] Populated booking cache for id={}", id);
        } catch (Exception e) {
            log.warn("[REDIS] Failed to cache booking: {}", e.getMessage());
        }

        return booking;
    }

    public List<Booking> findUserBookings(Long userId) {
        return bookingJpaRepository.findByUserIdOrderByBookingTimeDesc(userId);
    }

    @Transactional
    public Booking saveBooking(SeatReservationResponse seatResponse, Long userId, String threadName, int attempt, long startTimeMs) {
        User user = userJpaRepository.findById(userId)
                .orElseGet(() -> userJpaRepository.findAll().stream().findFirst()
                        .orElseGet(() -> userJpaRepository.save(User.builder()
                                .name("Guest User")
                                .email("guest@smartticket.com")
                                .password("password")
                                .role(User.Role.ROLE_USER)
                                .build())));

        Event event = eventJpaRepository.findById(seatResponse.getEventId())
                .orElseThrow(() -> new BookingException("Event not found with ID: " + seatResponse.getEventId()));

        Seat seat = seatJpaRepository.findById(seatResponse.getSeatId())
                .orElseThrow(() -> new BookingException("Seat reference not found with ID: " + seatResponse.getSeatId()));

        String txnId = TransactionIdGenerator.generateTransactionId();

        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .seat(seat)
                .transactionId(txnId)
                .bookingTime(LocalDateTime.now())
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        Booking savedBooking = bookingJpaRepository.save(booking);
        long execTime = System.currentTimeMillis() - startTimeMs;

        // Save Transaction Log
        TransactionLog logEntry = TransactionLog.builder()
                .transactionId(txnId)
                .threadName("[" + instanceId + "] " + threadName)
                .bookingStart(LocalDateTime.now().minusNanos(execTime * 1000000))
                .bookingEnd(LocalDateTime.now())
                .executionTimeMs(execTime)
                .retryCount(attempt - 1)
                .status("SUCCESS")
                .remarks("Seat " + seatResponse.getSeatNumber() + " reserved via Seat Service. Processed by " + instanceId)
                .build();
        logJpaRepository.save(logEntry);

        // Cache saved booking in Redis
        try {
            redisTemplate.opsForValue().set(BOOKING_CACHE_PREFIX + savedBooking.getId(), objectMapper.writeValueAsString(savedBooking), CACHE_TTL);
            log.info("[REDIS] Cached newly created booking id={}", savedBooking.getId());
        } catch (Exception e) {
            log.warn("[REDIS] Failed to write new booking to Redis: {}", e.getMessage());
        }

        return savedBooking;
    }

    public void saveFailedLog(BookingRequest request, String threadName, long startTime, int attempts, String status, String remarks) {
        long execTime = System.currentTimeMillis() - startTime;
        TransactionLog logEntry = TransactionLog.builder()
                .transactionId("FAILED-" + System.currentTimeMillis())
                .threadName("[" + instanceId + "] " + threadName)
                .bookingStart(LocalDateTime.now().minusNanos(execTime * 1000000))
                .bookingEnd(LocalDateTime.now())
                .executionTimeMs(execTime)
                .retryCount(attempts - 1)
                .status(status)
                .remarks(remarks + " (Processed by " + instanceId + ")")
                .build();
        logJpaRepository.save(logEntry);
    }

    public String getCacheMetrics() {
        long total = cacheHits + cacheMisses;
        double ratio = total > 0 ? ((double) cacheHits / total) * 100.0 : 0.0;
        return String.format("Cache Hits: %d | Cache Misses: %d | Hit Ratio: %.2f%% | Redis Failures: %d | DB Fallbacks: %d",
                cacheHits, cacheMisses, ratio, redisFailures, dbFallbacks);
    }
}
