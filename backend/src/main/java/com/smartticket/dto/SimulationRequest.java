package com.smartticket.dto;

import lombok.Data;

@Data
public class SimulationRequest {
    private int threadCount = 100; // 100, 200, 500, 1000
    private Long eventId;
    private boolean simulateConflicts = true;
}
