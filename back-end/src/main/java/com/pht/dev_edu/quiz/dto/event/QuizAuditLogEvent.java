package com.pht.dev_edu.quiz.dto.event;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    Object oldValue;
    Object newValue;
    String note;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime createdAt;
}
