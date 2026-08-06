package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.ScoringMethod;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizTypeConfigResponse {
    UUID id;
    UUID quizId;
    QuestionType questionType;
    Integer requiredCount;
    BigDecimal pointsPerQuestion;
    ScoringMethod scoringMethod;
}
