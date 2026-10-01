package com.smartticket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDto {
    private long totalUsers;
    private long totalEvents;
    private long totalBookings;
    private long confirmedBookings;
    private long failedBookings;
    private BigDecimal totalRevenue;
    private double averageBookingTimeMs;
    private long totalRetries;
    private long totalConflicts;
    private long totalDeadlocks;
    private long totalTimeouts;
    private double successRatePercent;
}
