package com.pht.dev_edu.assignment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class FeedbackRequest {
    @NotNull(message = "Submission is required")
    UUID submissionId;

    @NotBlank(message = "Feedback is required")
    String feedback;
}