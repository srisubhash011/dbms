package com.smartticket.controller;

import com.smartticket.dto.SeatDto;
import com.smartticket.dto.SeatReservationRequest;
import com.smartticket.dto.SeatReservationResponse;
import com.smartticket.services.SeatService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private static final Logger log = LoggerFactory.getLogger(SeatController.class);

    private final SeatService seatService;

    @Value("${service.instance.id:SEAT-SERVICE-1}")
    private String instanceId;

    @GetMapping("/{eventId}")
    public ResponseEntity<List<SeatDto>> getSeatsByEventId(@PathVariable Long eventId) {
        log.info("[{}] Received request GET /api/seats/{}", instanceId, eventId);
        return ResponseEntity.ok(seatService.getSeatsByEventId(eventId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<SeatReservationResponse> reserveSeat(@RequestBody SeatReservationRequest request) {
        log.info("[{}] Processing seat reservation request for Event ID: {}, Seat: {}",
                instanceId, request.getEventId(), request.getSeatNumber());
        SeatReservationResponse response = seatService.reserveSeat(request);
        return ResponseEntity.ok(response);
    }
}
