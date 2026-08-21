package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.DocumentStatus;
import com.pht.dev_edu.quiz.dto.enums.DocumentVisibility;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseDocumentResponse {
    UUID id;
    String title;
    String fileName;
    String fileObjectKey;
    Long fileSize;
    String contentHash;
    DocumentStatus status;
    DocumentVisibility visibility;
    Boolean isPromoted;
    String createdBy;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
