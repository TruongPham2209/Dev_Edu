package com.pht.dev_edu.lecture.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.lecture.entity.LectureCommentEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CommentResponse {
    UUID id;

    String authorUsername;

    String authorFullName;

    String authorAvatarUrl;

    UUID rootCommentId;

    UUID parentCommentId;

    String content;

    LocalDateTime createdAt;

    Boolean isDeleted;

    Boolean isMine;

    int depth;

    int replyCount;
}
