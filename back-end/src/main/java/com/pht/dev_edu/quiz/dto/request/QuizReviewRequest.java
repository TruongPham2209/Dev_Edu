package com.pht.dev_edu.quiz.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizReviewRequest {
    @NotNull(message = "Approved status is required")
    Boolean approved;

    String rejectionReason;
}
