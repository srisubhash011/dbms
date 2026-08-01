package com.smartticket.concurrency;

import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;

@Component
public class DeadlockHandler {
    private final ConcurrentHashMap<String, Long> activeThreadLocks = new ConcurrentHashMap<>();

    public void registerLockAttempt(String threadName, String resourceKey) {
        activeThreadLocks.put(threadName + ":" + resourceKey, System.currentTimeMillis());
    }

    public void releaseLockAttempt(String threadName, String resourceKey) {
        activeThreadLocks.remove(threadName + ":" + resourceKey);
    }

    public boolean isPotentialDeadlock(String threadName, String resourceKey) {
        Long lockTime = activeThreadLocks.get(threadName + ":" + resourceKey);
        if (lockTime != null && (System.currentTimeMillis() - lockTime) > 3000) {
            return true;
        }
        return false;
    }
}
