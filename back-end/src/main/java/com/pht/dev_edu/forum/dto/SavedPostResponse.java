package com.pht.dev_edu.forum.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.forum.entity.PostVersionEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class SavedPostResponse {
    UUID id;
    UUID postId;
    String thumbUrl;
    String title;
    String shortDescription;
    LocalDateTime savedAt;
}