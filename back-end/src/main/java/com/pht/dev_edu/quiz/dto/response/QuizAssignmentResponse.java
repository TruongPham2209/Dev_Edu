package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.AssignmentStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAssignmentResponse {
    UUID id;
    UUID quizId;
    String assignmentName;
    LocalDateTime startTime;
    LocalDateTime endTime;
    Integer durationMinutes;
    Boolean shuffleQuestions;
    Boolean shuffleOptions;
    Integer maxAttempts;
    AssignmentStatus status;
    String createdBy;
    LocalDateTime createdAt;
}
