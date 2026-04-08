package com.pht.dev_edu.course.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.course.entity.EnrollmentEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class EnrollmentResponse {
    UUID id;
    UUID courseId;
    String courseTitle;
    String thumbnailUrl;
    LocalDateTime enrolledAt;
}