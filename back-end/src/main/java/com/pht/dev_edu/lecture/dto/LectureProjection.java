package com.pht.dev_edu.lecture.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.lecture.entity.LectureEntity}
 */
public interface LectureProjection {
    UUID getId();

    String getTitle();

    String getSummary();

    String getContent();

    String getVideoObjectKey();

    Integer getLectureOrder();

    LocalDateTime getUploadedAt();

    Boolean getCompleted();
}