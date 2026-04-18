package com.pht.dev_edu.forum.dto;

import com.pht.dev_edu.common.validation.CreateValidation;
import com.pht.dev_edu.common.validation.UpdateValidation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class PostRequest {
    @Null(message = "Post ID must be null for creation", groups = {CreateValidation.class})
    @NotNull(message = "Post ID is required for update", groups = {UpdateValidation.class})
    UUID postId;

    @NotBlank(message = "Thumb is required", groups = {CreateValidation.class, UpdateValidation.class})
    String thumbObjectKey;

    @Size(max = 255, message = "Title must be at most 255 characters", groups = {CreateValidation.class, UpdateValidation.class})
    @NotBlank(message = "Title is required", groups = {CreateValidation.class, UpdateValidation.class})
    String title;

    @Size(max = 500, message = "Short description must be at most 500 characters", groups = {CreateValidation.class, UpdateValidation.class})
    @NotBlank(message = "Short description is required", groups = {CreateValidation.class, UpdateValidation.class})
    String shortDescription;

    @NotBlank(message = "Content is required", groups = {CreateValidation.class, UpdateValidation.class})
    String content;
}
