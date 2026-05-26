package com.pht.dev_edu.course.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.course.entity.CourseEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CourseResponse {
    UUID id;
    UUID categoryId;

    String title;
    String thumbnailObjectKey;
    String thumbnailUrl;
    String description;
    LocalDateTime createdAt;

    BigDecimal originalPrice;
    BigDecimal discountedPercentage;
    BigDecimal discountedPrice;
    LocalDateTime validTo;

    BigDecimal avgReview;
    Long totalReview;
    Long totalEnrollment;

    List<String> lecturers;
}