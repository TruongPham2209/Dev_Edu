package com.pht.dev_edu.quiz.dto.request;

import com.pht.dev_edu.common.validation.CreateValidation;
import com.pht.dev_edu.common.validation.UpdateValidation;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizRequest {
    @NotNull(groups = {CreateValidation.class}, message = "Course ID is required")
    UUID courseId;

    @NotBlank(groups = {CreateValidation.class, UpdateValidation.class}, message = "Quiz title is required")
    String title;

    String description;
}
