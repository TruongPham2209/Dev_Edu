package com.pht.dev_edu.forum.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.forum.dto.PostStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "forum_post_version")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostVersionEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "post_id", nullable = false)
    UUID postId;

    @Column(name = "version_number", nullable = false)
    Integer versionNumber;

    @Column(nullable = false)
    String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PostStatus status;

    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UuidCreator.getTimeOrderedEpoch();
        }

        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }

        if (createdAt == null) {
            createdAt = updatedAt;
        }
    }
}
