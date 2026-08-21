package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.QuizGenerationJobStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizGenerationJobResponse {
    UUID jobId;
    UUID courseId;
    UUID documentId;
    String documentName;
    QuizGenerationJobStatus status;
    String currentStep;
    Integer requestedTotal;
    Integer usableCapacity;
    Integer processedCount;
    Integer acceptedCount;
    Integer rejectedCount;
    Map<String, Integer> rejectionReasons;
    UUID resultQuizId;
    String errorMessage;
    Integer tokenUsage;
    Long executionTimeMs;
    String createdBy;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
