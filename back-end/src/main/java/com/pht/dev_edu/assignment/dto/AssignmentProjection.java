package com.pht.dev_edu.assignment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.assignment.entity.AssignmentEntity}
 */
public interface AssignmentProjection {
    UUID getId();

    String getTitle();

    String getDescription();

    LocalDateTime getCreatedAt();

    String getFileObjectKey();

    LocalDateTime getSubmittedAt();
}