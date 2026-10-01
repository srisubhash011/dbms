package com.smartticket.simulation;

import com.smartticket.dto.BookingRequest;
import com.smartticket.dto.SimulationRequest;
import com.smartticket.dto.SimulationResponse;
import com.smartticket.exception.SeatAlreadyBookedException;
import com.smartticket.model.Event;
import com.smartticket.model.PerformanceMetric;
import com.smartticket.model.Seat;
import com.smartticket.repository.EventRepository;
import com.smartticket.repository.PerformanceMetricRepository;
import com.smartticket.repository.SeatRepository;
import com.smartticket.services.BookingService;
import com.smartticket.utils.PerformanceCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

@Service
@RequiredArgsConstructor
public class SimulationService {

    private final BookingService bookingService;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final PerformanceMetricRepository performanceMetricRepository;

    public SimulationResponse runSimulation(SimulationRequest request) {
        int threads = request.getThreadCount() > 0 ? request.getThreadCount() : 100;
        
        // Find target event or default to first
        Event event;
        if (request.getEventId() != null) {
            event = eventRepository.findById(request.getEventId()).orElseGet(this::getOrCreateDefaultEvent);
        } else {
            event = getOrCreateDefaultEvent();
        }

        List<Seat> seats = seatRepository.findByEventIdOrderBySeatNumberAsc(event.getId());
        if (seats.isEmpty()) {
            seats = seatRepository.saveAll(createDefaultSeats(event));
        }

        ExecutorService executorService = Executors.newFixedThreadPool(Math.min(threads, 100));
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch completionLatch = new CountDownLatch(threads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger failedCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        AtomicInteger deadlockCount = new AtomicInteger(0);
        AtomicInteger timeoutCount = new AtomicInteger(0);
        AtomicLong totalResponseTimeMs = new AtomicLong(0);

        long startTime = System.currentTimeMillis();
        Random random = new Random();

        for (int i = 0; i < threads; i++) {
            final int threadNum = i + 1;
            final List<Seat> targetSeats = seats;

            executorService.submit(() -> {
                try {
                    latch.await(); // Wait for all threads to be ready for concurrent execution
                    long tStart = System.currentTimeMillis();

                    // If simulateConflicts is true, group threads onto the first few seats (e.g. Seat A12)
                    Seat targetSeat;
                    if (request.isSimulateConflicts()) {
                        targetSeat = targetSeats.get(random.nextInt(Math.min(3, targetSeats.size())));
                    } else {
                        targetSeat = targetSeats.get(random.nextInt(targetSeats.size()));
                    }

                    BookingRequest bReq = new BookingRequest();
                    bReq.setEventId(event.getId());
                    bReq.setSeatId(targetSeat.getId());
                    bReq.setSeatNumber(targetSeat.getSeatNumber());
                    bReq.setUserId(1L);

                    bookingService.bookTicket(bReq);
                    
                    long tEnd = System.currentTimeMillis();
                    totalResponseTimeMs.addAndGet(tEnd - tStart);
                    successCount.incrementAndGet();

                } catch (SeatAlreadyBookedException ex) {
                    failedCount.incrementAndGet();
                    conflictCount.incrementAndGet();
                } catch (com.smartticket.exception.TimeoutException ex) {
                    failedCount.incrementAndGet();
                    timeoutCount.incrementAndGet();
                } catch (Exception ex) {
                    failedCount.incrementAndGet();
                    if (ex.getMessage() != null && ex.getMessage().contains("deadlock")) {
                        deadlockCount.incrementAndGet();
                    } else {
                        conflictCount.incrementAndGet();
                    }
                } finally {
                    completionLatch.countDown();
                }
            });
        }

        // Release all threads simultaneously
        latch.countDown();

        try {
            boolean completed = completionLatch.await(30, TimeUnit.SECONDS);
            if (!completed) {
                timeoutCount.addAndGet(threads - (successCount.get() + failedCount.get()));
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            executorService.shutdownNow();
        }

        long totalDurationMs = System.currentTimeMillis() - startTime;
        double avgResponse = threads > 0 ? (double) totalResponseTimeMs.get() / Math.max(1, successCount.get()) : 0.0;
        double cpuUsage = PerformanceCalculator.getCpuUsagePercent();
        double memoryUsage = PerformanceCalculator.getMemoryUsageMb();

        PerformanceMetric metric = PerformanceMetric.builder()
                .totalThreads(threads)
                .successfulBookings(successCount.get())
                .failedBookings(failedCount.get())
                .conflicts(conflictCount.get())
                .deadlocks(deadlockCount.get())
                .timeouts(timeoutCount.get())
                .averageResponseMs(Math.round(avgResponse * 100.0) / 100.0)
                .cpuUsage(cpuUsage)
                .memoryUsageMb(memoryUsage)
                .createdAt(LocalDateTime.now())
                .build();

        performanceMetricRepository.save(metric);

        return SimulationResponse.builder()
                .totalThreads(threads)
                .successfulBookings(successCount.get())
                .failedBookings(failedCount.get())
                .conflicts(conflictCount.get())
                .deadlocks(deadlockCount.get())
                .timeouts(timeoutCount.get())
                .averageResponseMs(Math.round(avgResponse * 100.0) / 100.0)
                .totalTimeSeconds(Math.round((totalDurationMs / 1000.0) * 100.0) / 100.0)
                .cpuUsagePercent(cpuUsage)
                .memoryUsageMb(memoryUsage)
                .timestamp(LocalDateTime.now())
                .statusMessage("Concurrent simulation completed in " + totalDurationMs + " ms with " + threads + " worker threads!")
                .build();
    }

    private Event getOrCreateDefaultEvent() {
        return eventRepository.findAll().stream().findFirst().orElseGet(() -> {
            Event e = Event.builder()
                    .title("Avenger: Secret Wars Premiere")
                    .venue("Grand IMAX Theater")
                    .date(java.time.LocalDate.now().plusDays(5))
                    .time(java.time.LocalTime.of(19, 30))
                    .totalSeats(50)
                    .availableSeats(50)
                    .price(new BigDecimal("25.00"))
                    .description("High concurrency simulation test event")
                    .build();
            Event saved = eventRepository.save(e);
            seatRepository.saveAll(createDefaultSeats(saved));
            return saved;
        });
    }

    private List<Seat> createDefaultSeats(Event event) {
        List<Seat> seats = new ArrayList<>();
        char row = 'A';
        int col = 1;
        for (int i = 0; i < 50; i++) {
            seats.add(Seat.builder()
                    .event(event)
                    .seatNumber("" + row + (col < 10 ? "0" + col : col))
                    .status(Seat.SeatStatus.AVAILABLE)
                    .build());
            col++;
            if (col > 10) {
                col = 1;
                row++;
            }
        }
        return seats;
    }
}
