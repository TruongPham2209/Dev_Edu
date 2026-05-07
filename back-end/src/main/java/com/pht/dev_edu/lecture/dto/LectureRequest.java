package com.pht.dev_edu.lecture.dto;

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
public class LectureRequest {
    @Null(message = "Lecture id must be null when creating a new category", groups = {CreateValidation.class})
    @NotNull(message = "Lecture id must not be null", groups = {UpdateValidation.class})
    UUID id;

    @NotNull(message = "Course id must not be null", groups = {CreateValidation.class})
    UUID courseId;

    @NotBlank(message = "Lecture title must not be blank", groups = {CreateValidation.class, UpdateValidation.class})
    String title;

    @NotBlank(message = "Lecture summary must not be blank", groups = {CreateValidation.class, UpdateValidation.class})
    String summary;

    String content;

    @Null(message = "Video object key must be null when creating a new lecture", groups = {UpdateValidation.class})
    String videoObjectKey;
}
