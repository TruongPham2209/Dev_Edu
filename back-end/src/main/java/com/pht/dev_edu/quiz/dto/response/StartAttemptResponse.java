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
public class StartAttemptResponse {
    UUID attemptId;
    UUID assignmentId;
    UUID quizId;
    String studentUsername;
    Integer attemptNumber;
    AttemptStatus status;
    LocalDateTime startedAt;
    LocalDateTime expiresAt;
    BigDecimal maxScore;
    String activeSessionToken;
    List<QuizQuestionResponse> questions;
    List<QuizAttemptAnswerEntityDto> existingAnswers;
}
