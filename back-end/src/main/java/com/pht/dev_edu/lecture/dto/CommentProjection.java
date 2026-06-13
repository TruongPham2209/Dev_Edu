package com.pht.dev_edu.lecture.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.forum.entity.CommentEntity}
 */
public interface CommentProjection {
    UUID getId();

    String getContent();

    String getAuthorUsername();

    String getAuthorAvatarUrl();

    String getAuthorFullName();

    UUID getParentCommentId();

    UUID getRootCommentId();

    LocalDateTime getCreatedAt();

    int getReplyCount();

    boolean getIsDeleted();
}