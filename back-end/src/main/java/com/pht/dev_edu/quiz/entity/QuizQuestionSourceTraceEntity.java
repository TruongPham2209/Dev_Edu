package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
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
@Table(name = "quiz_question_source_trace")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizQuestionSourceTraceEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "question_id", nullable = false)
    UUID questionId;

    @Column(name = "generation_job_id", nullable = false)
    UUID generationJobId;

    @Column(name = "document_id")
    UUID documentId;

    @Column(name = "chunk_id")
    UUID chunkId;

    @Column(name = "section_name")
    String sectionName;

    @Column(name = "page_number")
    Integer pageNumber;

    @Column(name = "model_name")
    String modelName;

    @Column(name = "prompt_version")
    String promptVersion;

    @Column(name = "attempt_count")
    Integer attemptCount;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "validation_metrics", columnDefinition = "jsonb")
    String validationMetrics;

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
        if (attemptCount == null) {
            attemptCount = 1;
        }
    }
}
