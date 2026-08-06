package com.pht.dev_edu.quiz.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizEssaySubmissionResponse {
    UUID attemptAnswerId;
    UUID attemptId;
    UUID questionId;
    UUID assignmentId;
    String assignmentName;
    String studentUsername;
    String studentFullName;
    LocalDateTime submittedAt;
    LocalDateTime lastSavedAt;
    String questionContent;
    BigDecimal maxPoints;
    String answerText;
    BigDecimal awardedPoints;
    String feedback;
    String gradedBy;
    LocalDateTime gradedAt;
    String essayStatus;
}
