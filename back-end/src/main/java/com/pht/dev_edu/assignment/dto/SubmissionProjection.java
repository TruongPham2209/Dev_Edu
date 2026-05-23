package com.pht.dev_edu.assignment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.assignment.entity.SubmissionEntity}
 */
public interface SubmissionProjection {
    UUID getId();

    String getStudentUsername();

    String getFileObjectKey();

    LocalDateTime getSubmittedAt();

    String getFileName();

    String getContentType();

    Long getFileSize();
}