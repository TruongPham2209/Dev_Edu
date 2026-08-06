package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "quizzes")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "course_id", nullable = false)
    UUID courseId;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "description")
    String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    QuizStatus status;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @Column(name = "submitted_by")
    String submittedBy;

    @Column(name = "submitted_at")
    LocalDateTime submittedAt;

    @Column(name = "approved_by")
    String approvedBy;

    @Column(name = "approved_at")
    LocalDateTime approvedAt;

    @Column(name = "rejected_by")
    String rejectedBy;

    @Column(name = "rejected_at")
    LocalDateTime rejectedAt;

    @Column(name = "rejection_reason")
    String rejectionReason;

    @Column(name = "reviewed_by")
    String reviewedBy;

    @Column(name = "reviewed_at")
    LocalDateTime reviewedAt;

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
        if (status == null) {
            status = QuizStatus.DRAFT;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
