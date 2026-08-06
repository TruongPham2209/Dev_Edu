package com.pht.dev_edu.quiz.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizQuestionOptionResponse {
    UUID id;
    UUID questionId;
    String optionText;
    Boolean isCorrect;
    Integer orderIndex;
}
