package com.pht.dev_edu.course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ReviewRequest {
    @NotNull(message = "Course ID cannot be null")
    UUID courseId;

    @NotBlank(message = "Review content cannot be blank")
    String content;

    @Min(value = 1, message = "Rating must be at least 1")
    @Min(value = 5, message = "Rating must be at most 5")
    int rating;
}
