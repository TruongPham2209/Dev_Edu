package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.quiz.dto.enums.QuizGenerationJobStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "quiz_generation_jobs")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizGenerationJobEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "course_id", nullable = false)
    UUID courseId;

    @Column(name = "document_id")
    UUID documentId;

    @Column(name = "document_object_key")
    String documentObjectKey;

    @Column(name = "document_name")
    String documentName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    QuizGenerationJobStatus status;

    @Column(name = "current_step", nullable = false)
    String currentStep;

    @Column(name = "requested_total", nullable = false)
    Integer requestedTotal;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "requested_config", nullable = false, columnDefinition = "jsonb")
    String requestedConfig;

    @Column(name = "usable_capacity")
    Integer usableCapacity;

    @Column(name = "processed_count")
    Integer processedCount;

    @Column(name = "accepted_count")
    Integer acceptedCount;

    @Column(name = "rejected_count")
    Integer rejectedCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "rejection_reasons", columnDefinition = "jsonb")
    String rejectionReasons;

    @Column(name = "result_quiz_id")
    UUID resultQuizId;

    @Column(name = "error_message", columnDefinition = "TEXT")
    String errorMessage;

    @Column(name = "token_usage")
    Integer tokenUsage;

    @Column(name = "execution_time_ms")
    Long executionTimeMs;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

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
            status = QuizGenerationJobStatus.PENDING;
        }
        if (currentStep == null) {
            currentStep = "PENDING";
        }
        if (usableCapacity == null) {
            usableCapacity = 0;
        }
        if (processedCount == null) {
            processedCount = 0;
        }
        if (acceptedCount == null) {
            acceptedCount = 0;
        }
        if (rejectedCount == null) {
            rejectedCount = 0;
        }
        if (tokenUsage == null) {
            tokenUsage = 0;
        }
        if (executionTimeMs == null) {
            executionTimeMs = 0L;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
