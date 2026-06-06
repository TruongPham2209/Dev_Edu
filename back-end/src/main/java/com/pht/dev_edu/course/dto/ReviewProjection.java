package com.pht.dev_edu.course.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.course.entity.CourseReviewEntity}
 */
public interface ReviewProjection {
    UUID getId();

    String getComment();

    UUID getCourseId();

    Integer getRating();

    String getUsername();

    String getFullName();

    String getAvatarUrl();

    LocalDateTime getCreatedAt();
}