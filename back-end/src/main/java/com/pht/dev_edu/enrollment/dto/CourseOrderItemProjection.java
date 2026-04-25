package com.pht.dev_edu.enrollment.dto;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.course.entity.CourseEntity}
 */
public interface CourseOrderItemProjection {
    UUID getId();

    Boolean getRegistered();

    String getTitle();

    String getThumbnailUrl();

    BigDecimal getOriginalPrice();

    BigDecimal getDiscountedPercentage();
}