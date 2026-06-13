package com.pht.dev_edu.enrollment.dto;

import com.pht.dev_edu.enrollment.entity.EnrollmentEntity;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link EnrollmentEntity}
 */
public interface EnrollmentUserProjection {
    UUID getId();

    String getStudentUsername();

    String getStudentFullName();

    String getStudentAvatarUrl();

    LocalDateTime getEnrolledAt();
}