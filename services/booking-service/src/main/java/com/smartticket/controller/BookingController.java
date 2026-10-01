package com.smartticket.controller;

import com.smartticket.dto.BookingRequest;
import com.smartticket.dto.BookingResponse;
import com.smartticket.model.Booking;
import com.smartticket.services.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    private final BookingService bookingService;

    @Value("${service.instance.id:BOOKING-SERVICE-1}")
    private String instanceId;

    @PostMapping("/book")
    public ResponseEntity<BookingResponse> bookTicket(@Valid @RequestBody BookingRequest request) {
        log.info("[{}] Received POST /api/book for Event ID: {}, Seat: {}", instanceId, request.getEventId(), request.getSeatNumber());
        BookingResponse response = bookingService.bookTicket(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getUserBookings(@RequestParam(required = false, defaultValue = "1") Long userId) {
        log.info("[{}] Received GET /api/bookings for User ID: {}", instanceId, userId);
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        log.info("[{}] Received GET /api/bookings/{}", instanceId, id);
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }
}
