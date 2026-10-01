package com.smartticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingEvent implements Serializable {
    private String bookingId;
    private String transactionId;
    private Long userId;
    private String userEmail;
    private Long eventId;
    private String eventTitle;
    private String seatNumber;
    private BigDecimal price;
    private String status;
    private LocalDateTime timestamp;
    private String processedByInstance;
}
