package com.pht.dev_edu.payment.repo;

import com.pht.dev_edu.payment.CoursePaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CoursePaymentRepository extends JpaRepository<CoursePaymentEntity, UUID> {
}
