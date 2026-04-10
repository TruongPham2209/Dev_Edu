package com.pht.dev_edu.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class SubmissionRequest {
    @NotNull(message = "Assignment is required")
    UUID assignmentId;

    @NotBlank(message = "File object key is required")
    String fileObjectKey;
}