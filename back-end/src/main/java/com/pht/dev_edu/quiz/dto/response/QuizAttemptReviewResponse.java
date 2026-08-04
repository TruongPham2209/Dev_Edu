package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAttemptReviewResponse {
    UUID attemptId;
    UUID assignmentId;
    UUID quizId;
    String studentUsername;
    Integer attemptNumber;
    AttemptStatus status;
    LocalDateTime startedAt;
    LocalDateTime submittedAt;
    LocalDateTime gradedAt;
    BigDecimal maxScore;
    BigDecimal totalScore;
    List<AttemptAnswerResultDto> answers;
}
