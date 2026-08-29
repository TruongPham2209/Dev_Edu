package com.pht.dev_edu.quiz.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.quiz.dto.enums.DocumentStatus;
import com.pht.dev_edu.quiz.dto.enums.DocumentVisibility;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "course_documents")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseDocumentEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "title", nullable = false)
    String title;

    @Column(name = "file_name", nullable = false)
    String fileName;

    @Column(name = "file_object_key", nullable = false)
    String fileObjectKey;

    @Column(name = "file_size")
    Long fileSize;

    @Column(name = "content_hash", nullable = false, length = 64)
    String contentHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    DocumentStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibility", nullable = false)
    DocumentVisibility visibility;

    @Column(name = "is_promoted")
    Boolean isPromoted;

    @Column(name = "created_by", nullable = false)
    String createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

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
            status = DocumentStatus.UPLOADING;
        }
        if (visibility == null) {
            visibility = DocumentVisibility.TEMPORARY;
        }
        if (isPromoted == null) {
            isPromoted = false;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
