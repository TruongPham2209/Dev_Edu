package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.entity.PaymentHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistoryEntity, UUID> {
    @Modifying
    @Query(value = """
            DELETE FROM payment_history
            WHERE   expiration_time < :cutoffTime
            AND     status IN :statuses
            RETURNING id
            """, nativeQuery = true)
    List<UUID> deleteByExpirationTimeBeforeAndStatuses(java.time.LocalDateTime cutoffTime, List<String> statuses);
}