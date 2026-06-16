package com.pht.dev_edu.assignment.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.assignment.entity.FeedbackEntity}
 */
public interface FeedbackProjection {
    UUID getId();

    String getFeedback();

    String getLecturer();

    String getLecturerFullName();

    String getLecturerAvatar();

    LocalDateTime getCreatedAt();
}