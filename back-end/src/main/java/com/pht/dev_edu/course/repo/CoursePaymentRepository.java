package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.CoursePaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CoursePaymentRepository extends JpaRepository<CoursePaymentEntity, UUID> {
}
