package com.pht.dev_edu.assignment.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.assignment.entity.AssignmentEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AssignmentResponse {
    UUID id;
    String title;
    String description;
    LocalDateTime createdAt;

    String fileObjectKey; // If student has submitted, this will be the fileObjectKey of their submission; otherwise null
    LocalDateTime submittedAt; // If student has submitted, this will be the submittedAt of their submission; otherwise null
}