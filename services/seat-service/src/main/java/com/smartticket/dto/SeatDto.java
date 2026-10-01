package com.smartticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SeatDto {
    private Long id;
    private Long eventId;
    private String seatNumber;
    private String status;
    private Long version;
}
