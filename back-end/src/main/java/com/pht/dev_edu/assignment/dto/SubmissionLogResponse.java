package com.pht.dev_edu.assignment.dto;

import com.pht.dev_edu.tracking.entity.SubmissionTrackingEntity;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link SubmissionTrackingEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class SubmissionLogResponse {
    UUID id;

    SubmissionEvent.Action status;

    String details;

    LocalDateTime updatedAt;
}