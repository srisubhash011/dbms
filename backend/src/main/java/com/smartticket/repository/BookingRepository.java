package com.smartticket.repository;

import com.smartticket.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByBookingTimeDesc(Long userId);
    List<Booking> findByEventId(Long eventId);
    Optional<Booking> findByTransactionId(String transactionId);
    long countByStatus(Booking.BookingStatus status);
}
