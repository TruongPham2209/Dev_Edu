package com.pht.dev_edu.quiz.dto.request;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizQuestionRequest {
    @NotNull(message = "Question type is required")
    QuestionType questionType;

    @NotBlank(message = "Question content is required")
    String content;

    Integer orderIndex;

    @Valid
    List<QuizQuestionOptionRequest> options;
}
