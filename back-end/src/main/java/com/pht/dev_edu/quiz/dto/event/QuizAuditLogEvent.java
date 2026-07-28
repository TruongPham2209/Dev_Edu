package com.pht.dev_edu.quiz.dto.event;

import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAuditLogEvent {
    String entityType;
    UUID entityId;
    QuizAuditAction action;
    String performedBy;
    String oldValue;
    String newValue;
    String note;
    LocalDateTime createdAt;
}
