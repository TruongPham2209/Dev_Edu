package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.quiz.dto.enums.AssignmentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "quiz_assignments")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAssignmentEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "assignment_name", nullable = false)
    String assignmentName;

    @Column(name = "quiz_id", nullable = false)
    UUID quizId;

    @Column(name = "start_time", nullable = false)
    LocalDateTime startTime;

    @Column(name = "end_time")
    LocalDateTime endTime;

    @Column(name = "duration_minutes", nullable = false)
    Integer durationMinutes;

    @Column(name = "shuffle_questions", nullable = false)
    Boolean shuffleQuestions;

    @Column(name = "shuffle_options", nullable = false)
    Boolean shuffleOptions;

    @Column(name = "max_attempts", nullable = false)
    Integer maxAttempts;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    AssignmentStatus status;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @Column(name = "deleted_by")
    String deletedBy;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (shuffleQuestions == null) {
            shuffleQuestions = false;
        }
        if (shuffleOptions == null) {
            shuffleOptions = false;
        }
        if (maxAttempts == null) {
            maxAttempts = 1;
        }
        if (status == null) {
            status = AssignmentStatus.SCHEDULED;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
