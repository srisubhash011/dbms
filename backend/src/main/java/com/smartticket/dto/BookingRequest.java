package com.smartticket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BookingRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;

    private Long seatId;
    private String seatNumber;
    private Long userId;
}
