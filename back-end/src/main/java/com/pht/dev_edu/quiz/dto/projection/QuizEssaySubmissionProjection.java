package com.pht.dev_edu.quiz.dto.projection;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public interface QuizEssaySubmissionProjection {
    UUID getAttemptAnswerId();
    UUID getAttemptId();
    UUID getQuestionId();
    UUID getAssignmentId();
    String getAssignmentName();
    String getStudentUsername();
    String getStudentFullName();
    LocalDateTime getSubmittedAt();
    LocalDateTime getLastSavedAt();
    String getQuestionContent();
    BigDecimal getMaxPoints();
    String getAnswerText();
    BigDecimal getAwardedPoints();
    String getFeedback();
    String getGradedBy();
    LocalDateTime getGradedAt();
    String getEssayStatus();
}
