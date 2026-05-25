package com.pht.dev_edu.enrollment.dto;

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
public class CourseItemDetailResponse {
    UUID id;

    UUID courseId;
    String title;
    String thumbnailUrl;
    String description;

    LocalDateTime timestamp; // enrolledAt or createdAt
    PaymentStatus status; // order status

    BigDecimal originalPrice; // Null if item is not cart item
    BigDecimal discountedPrice;
}
