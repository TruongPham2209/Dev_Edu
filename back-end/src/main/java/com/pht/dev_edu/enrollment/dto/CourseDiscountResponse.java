package com.pht.dev_edu.enrollment.dto;

import com.pht.dev_edu.enrollment.entity.CourseDiscountEntity;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link CourseDiscountEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CourseDiscountResponse {
    UUID id;
    UUID courseId;
    BigDecimal originalPrice;
    String courseTitle;
    String courseDescription;
    String courseThumbnailUrl;

    String discountDescription;
    BigDecimal discountPercentage;
    LocalDateTime validFrom;
    LocalDateTime validTo;
    String createdBy;
    LocalDateTime createdAt;
}