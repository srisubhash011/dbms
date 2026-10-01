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
public class SimulationResponse {
    private Integer totalThreads;
    private Integer successfulBookings;
    private Integer failedBookings;
    private Integer conflicts;
    private Integer deadlocks;
    private Integer timeouts;
    private Double averageResponseMs;
    private Double totalTimeSeconds;
    private Double cpuUsagePercent;
    private Double memoryUsageMb;
    private LocalDateTime timestamp;
    private String statusMessage;
}
