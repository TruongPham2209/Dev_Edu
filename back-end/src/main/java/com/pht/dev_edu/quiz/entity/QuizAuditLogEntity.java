package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "quiz_audit_logs")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAuditLogEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "entity_type", nullable = false)
    String entityType;

    @Column(name = "entity_id", nullable = false)
    UUID entityId;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    QuizAuditAction action;

    @Column(name = "performed_by", nullable = false)
    String performedBy;

    @Column(name = "old_value", columnDefinition = "jsonb")
    String oldValue;

    @Column(name = "new_value", columnDefinition = "jsonb")
    String newValue;

    @Column(name = "note", columnDefinition = "TEXT")
    String note;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
