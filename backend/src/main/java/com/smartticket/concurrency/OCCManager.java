package com.smartticket.concurrency;

import com.smartticket.model.Seat;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Component;

@Component
public class OCCManager {

    public boolean isVersionConflict(Exception e) {
        return e instanceof ObjectOptimisticLockingFailureException ||
               (e.getCause() != null && e.getCause() instanceof ObjectOptimisticLockingFailureException);
    }

    public void validateSeatAvailable(Seat seat) {
        if (seat.getStatus() == Seat.SeatStatus.BOOKED) {
            throw new IllegalStateException("Seat " + seat.getSeatNumber() + " is already booked by another user");
        }
    }
}
