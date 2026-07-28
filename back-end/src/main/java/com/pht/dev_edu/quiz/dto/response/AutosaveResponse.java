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
public class AutosaveResponse {
    UUID attemptId;
    UUID questionId;
    Integer autosaveVersion;
    LocalDateTime lastSavedAt;
    Boolean saved;
    String message;
}
