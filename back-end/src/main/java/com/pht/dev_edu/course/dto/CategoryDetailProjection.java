package com.pht.dev_edu.course.dto;

import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.course.entity.CategoryEntity}
 */
public interface CategoryDetailProjection {
    UUID getId();

    String getName();

    String getDescription();

    String getThumbnailUrl();

    String getThumbnailObjectKey();

    Integer getTotalCourses();
}