package com.pht.dev_edu.course.dto;

import com.pht.dev_edu.enrollment.entity.EnrollmentEntity;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link EnrollmentEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class EnrolledCourseResponse {
    UUID id;
    UUID courseId;
    String title;
    String description;
    String thumbnailUrl;
    LocalDateTime enrolledAt;
    BigDecimal amount;
}
