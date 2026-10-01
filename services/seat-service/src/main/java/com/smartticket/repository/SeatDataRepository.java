package com.smartticket.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.smartticket.dto.SeatDto;
import com.smartticket.dto.SeatReservationRequest;
import com.smartticket.dto.SeatReservationResponse;
import com.smartticket.exception.BookingException;
import com.smartticket.exception.SeatAlreadyBookedException;
import com.smartticket.model.Event;
import com.smartticket.model.Seat;
import com.smartticket.utils.LoggerUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class SeatDataRepository {

    private static final Logger log = LoggerFactory.getLogger(SeatDataRepository.class);

    private final SeatRepository seatJpaRepository;
    private final EventRepository eventJpaRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Value("${service.instance.id:SEAT-SERVICE-1}")
    private String instanceId;

    private static final String SEATS_CACHE_PREFIX = "seats:event:";
    private static final String SEAT_LOCK_PREFIX = "lock:seat:";
    private static final Duration CACHE_TTL = Duration.ofMinutes(10);

    // Track Cache Hit/Miss Metrics
    private long cacheHits = 0;
    private long cacheMisses = 0;
    private long redisFailures = 0;
    private long dbFallbacks = 0;

    public List<SeatDto> findSeatsByEventId(Long eventId) {
        String cacheKey = SEATS_CACHE_PREFIX + eventId;
        try {
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);
            if (cachedJson != null) {
                cacheHits++;
                log.info("[REDIS] Cache HIT seats for event {}", eventId);
                List<SeatDto> seatDtos = objectMapper.readValue(cachedJson,
                        objectMapper.getTypeFactory().constructCollectionType(List.class, SeatDto.class));
                return seatDtos;
            } else {
                cacheMisses++;
                log.info("[REDIS] Cache MISS seats for event {}", eventId);
            }
        } catch (Exception e) {
            redisFailures++;
            dbFallbacks++;
            log.warn("[REDIS] Redis unavailable when reading seats: {}. Fallback to MySQL.", e.getMessage());
        }

        // Fetch from MySQL through JPA repository
        List<Seat> seats = seatJpaRepository.findByEventIdOrderBySeatNumberAsc(eventId);
        List<SeatDto> dtos = seats.stream()
                .map(seat -> SeatDto.builder()
                        .id(seat.getId())
                        .eventId(seat.getEvent().getId())
                        .seatNumber(seat.getSeatNumber())
                        .status(seat.getStatus().name())
                        .version(seat.getVersion())
                        .build())
                .collect(Collectors.toList());

        // Cache-aside populate Redis
        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(dtos), CACHE_TTL);
            log.info("[REDIS] Populated seats cache for event {}", eventId);
        } catch (Exception e) {
            log.warn("[REDIS] Failed to write seats to Redis cache: {}", e.getMessage());
        }

        return dtos;
    }

    @Transactional
    public SeatReservationResponse reserveSeatAtomically(SeatReservationRequest request) {
        Seat seat;
        if (request.getSeatId() != null) {
            seat = seatJpaRepository.findById(request.getSeatId())
                    .orElseThrow(() -> new BookingException("Seat not found with ID: " + request.getSeatId()));
        } else if (request.getSeatNumber() != null && request.getEventId() != null) {
            seat = seatJpaRepository.findByEventIdAndSeatNumber(request.getEventId(), request.getSeatNumber())
                    .orElseThrow(() -> new BookingException("Seat " + request.getSeatNumber() + " not found for event"));
        } else {
            throw new BookingException("Invalid seat parameters provided");
        }

        String lockKey = SEAT_LOCK_PREFIX + seat.getEvent().getId() + ":" + seat.getSeatNumber();
        boolean lockAcquired = false;

        // Step 1: Atomic Redis Reservation Check using SETNX
        try {
            Boolean setnxResult = redisTemplate.opsForValue().setIfAbsent(lockKey, "RESERVED", 30, TimeUnit.SECONDS);
            lockAcquired = Boolean.TRUE.equals(setnxResult);
            if (!lockAcquired) {
                log.warn("[REDIS] Atomic Reservation Failed: Seat {} is locked in Redis", seat.getSeatNumber());
                throw new SeatAlreadyBookedException("Seat " + seat.getSeatNumber() + " is already being booked by another process.");
            }
            log.info("[REDIS] Atomic seat reservation successful for seat={}", seat.getSeatNumber());
        } catch (SeatAlreadyBookedException e) {
            throw e;
        } catch (Exception e) {
            redisFailures++;
            log.warn("[REDIS] Redis unavailable during reservation lock: {}. Proceeding directly to MySQL OCC protection.", e.getMessage());
        }

        // Step 2: Database Check & Mutation (JPA @Version OCC)
        try {
            if (seat.getStatus() == Seat.SeatStatus.BOOKED) {
                log.warn("[MYSQL] Seat {} is already BOOKED in database", seat.getSeatNumber());
                throw new SeatAlreadyBookedException("Seat " + seat.getSeatNumber() + " is already booked.");
            }

            Event event = seat.getEvent();
            if (event.getAvailableSeats() <= 0) {
                throw new BookingException("No available seats left for this event.");
            }

            seat.setStatus(Seat.SeatStatus.BOOKED);
            seatJpaRepository.save(seat);

            event.setAvailableSeats(event.getAvailableSeats() - 1);
            eventJpaRepository.save(event);

            log.info("[MYSQL] Booking persisted for seat={} (JPA Version: {})", seat.getSeatNumber(), seat.getVersion());

            // Step 3: Cache Update / Invalidation
            try {
                redisTemplate.delete(SEATS_CACHE_PREFIX + event.getId());
                log.info("[REDIS] Cache invalidated for event={}", event.getId());
            } catch (Exception ex) {
                log.warn("[REDIS] Failed to invalidate cache: {}", ex.getMessage());
            }

            return SeatReservationResponse.builder()
                    .success(true)
                    .seatId(seat.getId())
                    .seatNumber(seat.getSeatNumber())
                    .eventId(event.getId())
                    .eventTitle(event.getTitle())
                    .venue(event.getVenue())
                    .price(event.getPrice())
                    .message("Seat reserved successfully with OCC and Redis atomic lock")
                    .build();

        } catch (Exception ex) {
            // Step 4: Safely release Redis lock on failure
            if (lockAcquired) {
                try {
                    redisTemplate.delete(lockKey);
                    log.info("[REDIS] Released temporary Redis reservation lock for seat={}", seat.getSeatNumber());
                } catch (Exception e) {
                    log.error("[REDIS] Error releasing Redis lock: {}", e.getMessage());
                }
            }
            throw ex;
        }
    }

    public String getCacheMetrics() {
        long total = cacheHits + cacheMisses;
        double ratio = total > 0 ? ((double) cacheHits / total) * 100.0 : 0.0;
        return String.format("Cache Hits: %d | Cache Misses: %d | Hit Ratio: %.2f%% | Redis Failures: %d | DB Fallbacks: %d",
                cacheHits, cacheMisses, ratio, redisFailures, dbFallbacks);
    }
}
