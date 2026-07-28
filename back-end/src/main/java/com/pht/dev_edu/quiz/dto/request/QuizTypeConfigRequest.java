package com.pht.dev_edu.quiz.dto.request;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.ScoringMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizTypeConfigRequest {
    @NotNull(message = "Question type is required")
    QuestionType questionType;

    @NotNull(message = "Required count is required")
    @Min(value = 1, message = "Required count must be at least 1")
    Integer requiredCount;

    @NotNull(message = "Points per question is required")
    @DecimalMin(value = "0.0", message = "Points must be non-negative")
    BigDecimal pointsPerQuestion;

    @NotNull(message = "Scoring method is required")
    ScoringMethod scoringMethod;
}
