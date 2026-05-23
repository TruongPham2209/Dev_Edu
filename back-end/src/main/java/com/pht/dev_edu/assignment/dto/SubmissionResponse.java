package com.pht.dev_edu.assignment.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.assignment.entity.SubmissionEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class SubmissionResponse {
    UUID id;
    String studentUsername;
    String fileObjectKey;
    LocalDateTime submittedAt;
    String fileName;
    String contentType;
    Long fileSize;
}