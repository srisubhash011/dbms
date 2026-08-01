package com.smartticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "performance_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PerformanceMetric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "total_threads", nullable = false)
    private Integer totalThreads;

    @Column(name = "successful_bookings", nullable = false)
    private Integer successfulBookings;

    @Column(name = "failed_bookings", nullable = false)
    private Integer failedBookings;

    @Column(nullable = false)
    private Integer conflicts;

    @Column(nullable = false)
    private Integer deadlocks;

    @Column(nullable = false)
    private Integer timeouts;

    @Column(name = "average_response", nullable = false)
    private Double averageResponseMs;

    @Column(name = "cpu_usage")
    private Double cpuUsage;

    @Column(name = "memory_usage")
    private Double memoryUsageMb;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}
