package com.pht.dev_edu.enrollment.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.course.entity.CourseEntity}
 */
public interface EnrolledCourseProjection {
    UUID getId();

    UUID getCourseId();

    String getTitle();

    String getThumbnailUrl();

    String getDescription();

    LocalDateTime getEnrolledAt();

    BigDecimal getDiscountedPrice();
}