package com.smartticket.controller;

import com.smartticket.dto.DashboardSummaryDto;
import com.smartticket.model.PerformanceMetric;
import com.smartticket.model.TransactionLog;
import com.smartticket.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardSummaryDto> getDashboardSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/logs")
    public ResponseEntity<List<TransactionLog>> getLatestLogs() {
        return ResponseEntity.ok(dashboardService.getLatestLogs());
    }

    @GetMapping("/performance")
    public ResponseEntity<List<PerformanceMetric>> getPerformanceHistory() {
        return ResponseEntity.ok(dashboardService.getPerformanceHistory());
    }
}
