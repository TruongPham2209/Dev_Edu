package com.pht.dev_edu.forum.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.forum.entity.PostVersionEntity}
 */
public record PostInfoProjection(
        UUID id,

        String authorUsername,

        String authorFullName,

        String authorAvatarUrl,

        String thumbUrl,

        String title,

        String shortDescription,

        String content,

        Integer getViews,

        Integer comments,

        PostStatus status,

        LocalDateTime updatedAt,

        LocalDateTime createdAt
) {
}
