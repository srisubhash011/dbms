package com.smartticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatReservationRequest implements Serializable {
    private Long eventId;
    private Long seatId;
    private String seatNumber;
    private Long userId;
}
