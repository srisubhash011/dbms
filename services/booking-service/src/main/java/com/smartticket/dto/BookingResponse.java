package com.smartticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {
    private Long bookingId;
    private String transactionId;
    private String eventTitle;
    private String venue;
    private String seatNumber;
    private LocalDateTime bookingTime;
    private String status;
    private Integer retriesAttempted;
    private Long executionTimeMs;
    private String message;
}
