package com.pht.dev_edu.course.repo;

import com.pht.dev_edu.course.entity.EnrollmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<EnrollmentEntity, UUID> {
    boolean existsByCourseId(UUID courseId);
}
