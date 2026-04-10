package com.pht.dev_edu.lecture.dto;

import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for {@link com.pht.dev_edu.lecture.entity.LectureEntity}
 */
@Data
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class LectureResponse {
    UUID id;

    String title;

    String summary;

    String content; // Null if you get list from course

    String videoObjectKey; // Null if you get list from course

    LocalDateTime uploadedAt;

    Boolean isCompleted; // Only for student in course detail page
}
