package com.pht.dev_edu.forum.entity;

import com.github.f4b6a3.uuid.UuidCreator;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@Entity
@Table(name = "forum_comment")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "post_id", nullable = false)
    UUID postId;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(name = "author", nullable = false)
    String author;

    @Column(name = "parent_comment_id")
    UUID parentCommentId;

    @Column(name = "created_at")
    LocalDateTime createdAt;

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
    }
}
