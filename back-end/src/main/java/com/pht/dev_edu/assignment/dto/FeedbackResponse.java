package com.pht.dev_edu.assignment.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.assignment.entity.FeedbackEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class FeedbackResponse {
    UUID id;
    String feedback;
    String lecturer;
    LocalDateTime createdAt;
}