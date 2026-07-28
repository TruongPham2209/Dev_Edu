package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "quiz_attempts")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAttemptEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "assignment_id", nullable = false)
    UUID assignmentId;

    @Column(name = "quiz_id", nullable = false)
    UUID quizId;

    @Column(name = "student_username", nullable = false)
    String studentUsername;

    @Column(name = "attempt_number", nullable = false)
    Integer attemptNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    AttemptStatus status;

    @Column(name = "started_at", nullable = false)
    LocalDateTime startedAt;

    @Column(name = "expires_at", nullable = false)
    LocalDateTime expiresAt;

    @Column(name = "submitted_at")
    LocalDateTime submittedAt;

    @Column(name = "graded_at")
    LocalDateTime gradedAt;

    @Column(name = "total_score", precision = 6, scale = 2)
    BigDecimal totalScore;

    @Column(name = "max_score", nullable = false, precision = 6, scale = 2)
    BigDecimal maxScore;

    @Column(name = "question_order", nullable = false, columnDefinition = "jsonb")
    String questionOrder;

    @Column(name = "active_session_token")
    String activeSessionToken;

    @Column(name = "lock_acquired_at")
    LocalDateTime lockAcquiredAt;

    @Column(name = "last_heartbeat_at")
    LocalDateTime lastHeartbeatAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = AttemptStatus.IN_PROGRESS;
        }
        if (attemptNumber == null) {
            attemptNumber = 1;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
