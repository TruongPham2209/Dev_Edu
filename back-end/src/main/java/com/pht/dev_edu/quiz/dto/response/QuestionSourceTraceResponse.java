package com.pht.dev_edu.quiz.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionSourceTraceResponse {
    UUID id;
    UUID questionId;
    UUID generationJobId;
    UUID documentId;
    UUID chunkId;
    String sectionName;
    Integer pageNumber;
    String modelName;
    String promptVersion;
    Integer attemptCount;
    String validationMetrics;
    LocalDateTime createdAt;
}
