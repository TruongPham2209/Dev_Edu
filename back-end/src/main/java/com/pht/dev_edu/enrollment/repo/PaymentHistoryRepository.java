package com.pht.dev_edu.enrollment.repo;

import com.pht.dev_edu.enrollment.entity.PaymentHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PaymentHistoryRepository extends JpaRepository<PaymentHistoryEntity, UUID> {
}