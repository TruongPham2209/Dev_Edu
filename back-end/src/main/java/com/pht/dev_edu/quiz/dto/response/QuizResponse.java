package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizResponse {
    UUID id;
    UUID courseId;
    String title;
    String description;
    QuizStatus status;
    String createdBy;
    String submittedBy;
    LocalDateTime submittedAt;
    String approvedBy;
    LocalDateTime approvedAt;
    String rejectedBy;
    LocalDateTime rejectedAt;
    String rejectionReason;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
