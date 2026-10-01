package com.smartticket.concurrency;

import org.springframework.stereotype.Component;

import java.util.Random;

@Component
public class RetryManager {
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 50;
    private final Random random = new Random();

    public int getMaxRetries() {
        return MAX_RETRIES;
    }

    public long calculateBackoffDelay(int attempt) {
        // Exponential backoff: 50ms, 100ms, 200ms + random jitter
        long delay = INITIAL_BACKOFF_MS * (1L << (attempt - 1));
        long jitter = random.nextInt(25);
        return delay + jitter;
    }

    public void executeBackoff(int attempt) {
        long delay = calculateBackoffDelay(attempt);
        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
