package com.smartticket.repository;

import com.smartticket.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByEventIdOrderBySeatNumberAsc(Long eventId);

    Optional<Seat> findByEventIdAndSeatNumber(Long eventId, String seatNumber);

    @Lock(LockModeType.OPTIMISTIC)
    @Query("SELECT s FROM Seat s WHERE s.id = :id")
    Optional<Seat> findByIdWithOptimisticLock(@Param("id") Long id);

    long countByEventIdAndStatus(Long eventId, Seat.SeatStatus status);
}
