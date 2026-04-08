package com.pht.dev_edu.course.dto;

import com.pht.dev_edu.common.validation.CreateValidation;
import com.pht.dev_edu.common.validation.UpdateValidation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Null;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CategoryRequest {
    @Null(message = "Category id must be null when creating a new category", groups = {CreateValidation.class})
    @NotNull(message = "Category id must not be null", groups = {UpdateValidation.class})
    UUID id;

    @NotBlank(message = "Category name must not be blank", groups = {UpdateValidation.class, CreateValidation.class})
    String name;

    @NotBlank(message = "Category description must not be blank", groups = {UpdateValidation.class, CreateValidation.class})
    String description;

    @NotBlank(message = "Thumbnail must not be blank", groups = {UpdateValidation.class, CreateValidation.class})
    String thumbnailObjectKey;
}
