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
public class DocumentUploadAuditResponse {
    UUID id;
    String uploadedBy;
    String userRole;
    String fileName;
    Long fileSize;
    String contentHash;
    UUID quizId;
    UUID courseId;
    UUID generationJobId;
    Boolean requestedSave;
    Boolean isPromoted;
    String promotionStatus;
    String failureReason;
    LocalDateTime createdAt;
}
