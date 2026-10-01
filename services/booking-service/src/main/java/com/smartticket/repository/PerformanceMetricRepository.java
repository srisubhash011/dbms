package com.smartticket.repository;

import com.smartticket.model.PerformanceMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceMetricRepository extends JpaRepository<PerformanceMetric, Long> {
    List<PerformanceMetric> findTop20ByOrderByCreatedAtDesc();
    Optional<PerformanceMetric> findTopByOrderByCreatedAtDesc();
}
