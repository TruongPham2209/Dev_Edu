package com.pht.dev_edu.forum.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.forum.entity.PostVersionEntity}
 */
public interface PostDetailProjection {
    UUID getId();

    String getAuthorUsername();

    String getAuthorFullName();

    String getAuthorAvatarUrl();

    String getThumbUrl();

    String getTitle();

    String getShortDescription();

    String getContent();

    Integer getViews();

    Integer getComments();

    PostStatus getStatus();

    LocalDateTime getUpdatedAt();

    LocalDateTime getCreatedAt();
}