package com.smartticket.concurrency;

import org.springframework.stereotype.Component;

@Component
public class TimeoutHandler {
    private static final long MAX_TRANSACTION_TIMEOUT_MS = 5000;

    public void checkTimeout(long startTimeMs) {
        long elapsed = System.currentTimeMillis() - startTimeMs;
        if (elapsed > MAX_TRANSACTION_TIMEOUT_MS) {
            throw new com.smartticket.exception.TimeoutException("Transaction timed out after " + elapsed + " ms");
        }
    }
}
