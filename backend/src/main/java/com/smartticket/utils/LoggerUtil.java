package com.smartticket.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggerUtil {
    private static final Logger log = LoggerFactory.getLogger("SmartTicketConcurrency");

    public static void logBookingAttempt(String threadName, String seatNumber, int attempt, String status) {
        log.info("[CONCURRENCY] Thread: {} | Seat: {} | Attempt: {} | Status: {}", threadName, seatNumber, attempt, status);
    }

    public static void logRetryBackoff(String threadName, int attempt, long backoffMs) {
        log.warn("[BACKOFF] Thread: {} | Attempt: {} | Backoff Delay: {} ms", threadName, attempt, backoffMs);
    }

    public static void logConflict(String threadName, String seatNumber, String details) {
        log.error("[CONFLICT] OCC Version Mismatch | Thread: {} | Seat: {} | Details: {}", threadName, seatNumber, details);
    }
}
