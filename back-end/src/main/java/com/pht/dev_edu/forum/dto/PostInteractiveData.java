package com.pht.dev_edu.forum.dto;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PostInteractiveData {
    UUID postId;
    LocalDateTime updatedAt;
    long viewCount;
    long saveCount;
    long popularityScore;
    String combinedText;
}
