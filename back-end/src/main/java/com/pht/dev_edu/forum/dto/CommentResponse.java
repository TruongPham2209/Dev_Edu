package com.pht.dev_edu.forum.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.forum.entity.CommentEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CommentResponse {
    UUID id;
    String authorUsername;
    String authorFullName;
    String authorAvatarUrl;
    String content;
    int replyCount;
    UUID repliedToCommentId;
    LocalDateTime createdAt;
    Boolean isDeleted;
    Boolean isMine;
}