package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "document_upload_audits")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentUploadAuditEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "uploaded_by", nullable = false)
    String uploadedBy;

    @Column(name = "user_role", nullable = false)
    String userRole;

    @Column(name = "file_name", nullable = false)
    String fileName;

    @Column(name = "file_size")
    Long fileSize;

    @Column(name = "content_hash", nullable = false, length = 64)
    String contentHash;

    @Column(name = "quiz_id")
    UUID quizId;

    @Column(name = "course_id", nullable = false)
    UUID courseId;

    @Column(name = "generation_job_id", nullable = false)
    UUID generationJobId;

    @Column(name = "requested_save")
    Boolean requestedSave;

    @Column(name = "is_promoted")
    Boolean isPromoted;

    @Column(name = "promotion_status", nullable = false)
    String promotionStatus;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    String failureReason;

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
        if (requestedSave == null) {
            requestedSave = false;
        }
        if (isPromoted == null) {
            isPromoted = false;
        }
    }
}
