package com.pht.dev_edu.forum.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Projection for {@link com.pht.dev_edu.forum.entity.SavedPostEntity}
 */
public interface SavedPostProjection {
    UUID getId();

    UUID getPostId();

    String getTitle();

    String getShortDescription();

    String getThumbUrl();

    LocalDateTime getSavedAt();
}