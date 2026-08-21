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
@Table(name = "document_knowledge_chunks")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentKnowledgeChunkEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "document_id", nullable = false)
    UUID documentId;

    @Column(name = "section_name")
    String sectionName;

    @Column(name = "page_number")
    Integer pageNumber;

    @Column(name = "chunk_index", nullable = false)
    Integer chunkIndex;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(name = "content_hash", nullable = false, length = 64)
    String contentHash;

    @Column(name = "embedding", nullable = false, columnDefinition = "vector(1536)")
    String embedding;

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
        if (chunkIndex == null) {
            chunkIndex = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
