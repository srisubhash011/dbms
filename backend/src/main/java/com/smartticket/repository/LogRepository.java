package com.smartticket.repository;

import com.smartticket.model.TransactionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<TransactionLog, Long> {
    List<TransactionLog> findTop100ByOrderByIdDesc();
    
    @Query("SELECT COUNT(t) FROM TransactionLog t WHERE t.retryCount > 0")
    long countTotalRetries();
}
