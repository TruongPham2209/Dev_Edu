package com.pht.dev_edu.forum.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.forum.entity.PostEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PostResponse {
    UUID id;
    String title;
    String content;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}