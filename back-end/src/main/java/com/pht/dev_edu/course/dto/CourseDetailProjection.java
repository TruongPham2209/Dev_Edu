package com.pht.dev_edu.course.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.course.entity.CourseEntity}
 */
public interface CourseDetailProjection {
    UUID getId();

    String getTitle();

    String getDescription();

    String getThumbnailUrl();

    String getThumbnailObjectKey();

    BigDecimal getOriginalPrice();

    BigDecimal getDiscountedPercentage();

    LocalDateTime getValidTo();

    String getCreatedBy();

    LocalDateTime getCreatedAt();
}