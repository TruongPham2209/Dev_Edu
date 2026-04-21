package com.pht.dev_edu.course.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.course.entity.CourseReviewEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ReviewResponse {
    UUID id;
    String comment;
    Integer rating;
    String username;
    LocalDateTime createdAt;
}