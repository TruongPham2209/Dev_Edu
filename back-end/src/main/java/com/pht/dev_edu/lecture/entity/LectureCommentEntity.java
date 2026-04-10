package com.pht.dev_edu.lecture.entity;

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
@Table(name = "lecture_comment")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LectureCommentEntity {
    @Id
    @Column(nullable = false, updatable = false)
    UUID id;

    @Column(name = "lecture_id", nullable = false)
    UUID lectureId;

    @Column(nullable = false)
    String username;

    @Column(nullable = false, columnDefinition = "TEXT")
    String content;

    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "deleted_at")
    LocalDateTime deletedAt;

    @Column(name = "root_comment_id")
    UUID rootCommentId;

    @Column(name = "parent_comment_id")
    UUID parentCommentId;

    @Column(name = "reply_to_comment_id")
    UUID replyToCommentId;

    @Column(name = "depth", nullable = false)
    Integer depth;

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
