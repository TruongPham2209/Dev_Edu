package com.pht.dev_edu.course.dto;

import com.pht.dev_edu.common.validation.CreateValidation;
import com.pht.dev_edu.common.validation.UpdateValidation;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class CourseRequest {
    @NotNull(message = "ID cannot be null", groups = {UpdateValidation.class})
    UUID id;

    @NotNull(message = "Category ID cannot be null", groups = {UpdateValidation.class, CreateValidation.class})
    UUID categoryId;

    // Max 255 chars for title
    @Size(max = 255, message = "Title must not exceed 255 characters",
            groups = {UpdateValidation.class, CreateValidation.class})
    @NotBlank(message = "Title cannot be blank", groups = {UpdateValidation.class, CreateValidation.class})
    String title;

    @NotBlank(message = "Description cannot be blank", groups = {UpdateValidation.class, CreateValidation.class})
    String description;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0",
            groups = {UpdateValidation.class, CreateValidation.class})
    BigDecimal price;

    @NotBlank(message = "Thumbnail object key cannot be blank",
            groups = {UpdateValidation.class, CreateValidation.class})
    String thumbnailObjectKey;

    @NotEmpty(message = "At least one lecturer must be assigned to the course",
            groups = {CreateValidation.class, UpdateValidation.class})
    List<@NotBlank String> lecturerUsernames;
}
