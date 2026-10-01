package com.smartticket.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "transaction_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "thread_name")
    private String threadName;

    @Column(name = "booking_start")
    private LocalDateTime bookingStart;

    @Column(name = "booking_end")
    private LocalDateTime bookingEnd;

    @Column(name = "execution_time")
    private Long executionTimeMs;

    @Column(name = "retry_count")
    private Integer retryCount;

    @Column(nullable = false)
    private String status;

    @Column(length = 1000)
    private String remarks;
}
