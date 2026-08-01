package com.smartticket.controller;

import com.smartticket.dto.SeatDto;
import com.smartticket.services.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/{eventId}")
    public ResponseEntity<List<SeatDto>> getSeatsByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(seatService.getSeatsByEventId(eventId));
    }
}
