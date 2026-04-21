package com.pht.dev_edu.enrollment.dto;

import com.pht.dev_edu.enrollment.entity.EnrollmentEntity;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link EnrollmentEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class EnrollmentUserResponse {
    UUID id;
    String username;
    String fullName;
    LocalDateTime enrolledAt;
}