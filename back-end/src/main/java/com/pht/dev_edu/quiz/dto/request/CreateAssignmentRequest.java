package com.pht.dev_edu.quiz.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateAssignmentRequest {
    @NotNull(message = "Quiz ID is required")
    UUID quizId;

    @NotBlank(message = "Assignment name is required")
    String assignmentName;

    @NotNull(message = "Start time is required")
    LocalDateTime startTime;

    LocalDateTime endTime;

    @NotNull(message = "Duration minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    Integer durationMinutes;

    Boolean shuffleQuestions;
    Boolean shuffleOptions;

    @NotNull(message = "Max attempts is required")
    @Min(value = 1, message = "Max attempts must be at least 1")
    Integer maxAttempts;
}
