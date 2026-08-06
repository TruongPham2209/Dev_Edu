package com.pht.dev_edu.quiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizQuestionOptionRequest {
    UUID id;

    @NotBlank(message = "Option text is required")
    String optionText;

    @NotNull(message = "isCorrect is required")
    Boolean isCorrect;

    Integer orderIndex;
}
