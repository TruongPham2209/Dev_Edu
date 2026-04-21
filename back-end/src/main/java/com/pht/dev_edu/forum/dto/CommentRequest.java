package com.pht.dev_edu.forum.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CommentRequest {
    @NotNull(message = "Post ID cannot be null")
    UUID postId;

    @NotBlank(message = "Content cannot be blank")
    String content;

    UUID repliedToCommentId; // Optional, can be null for top-level comments\
}
