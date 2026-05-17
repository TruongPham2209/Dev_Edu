package com.pht.dev_edu.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class FeedbackRequest {
    @NotNull(message = "Assignment is required")
    UUID assignmentId;

    @NotBlank(message = "Student username is required")
    String studentUsername;

    @NotBlank(message = "Feedback is required")
    String feedback;
}