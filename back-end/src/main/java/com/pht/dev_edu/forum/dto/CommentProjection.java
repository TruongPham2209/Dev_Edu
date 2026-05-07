package com.pht.dev_edu.forum.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.forum.entity.CommentEntity}
 */
public interface CommentProjection {
    UUID getId();

    String getContent();

    String getAuthor();

    UUID getRepliedToCommentId();

    Integer getReplyCount();

    LocalDateTime getCreatedAt();

    boolean getIsDeleted();
}