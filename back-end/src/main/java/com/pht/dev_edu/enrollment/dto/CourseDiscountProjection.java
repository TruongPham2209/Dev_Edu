package com.pht.dev_edu.enrollment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.enrollment.entity.CourseDiscountEntity}
 */
public interface CourseDiscountProjection {
    UUID getId();

    UUID getCourseId();

    String getCourseTitle();

    String getCourseDescription();

    String getCourseThumbnailUrl();

    BigDecimal getOriginalPrice();

    String getDiscountDescription();

    BigDecimal getDiscountPercentage();

    LocalDateTime getValidFrom();

    LocalDateTime getValidTo();

    String getCreatedBy();

    LocalDateTime getCreatedAt();
}