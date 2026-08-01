package com.smartticket.controller;

import com.smartticket.dto.BookingRequest;
import com.smartticket.dto.BookingResponse;
import com.smartticket.model.Booking;
import com.smartticket.services.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/book")
    public ResponseEntity<BookingResponse> bookTicket(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.ok(bookingService.bookTicket(request));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<Booking>> getUserBookings(@RequestParam(required = false, defaultValue = "1") Long userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }
}
