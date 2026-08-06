package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizQuestionResponse {
    UUID id;
    UUID quizId;
    QuestionType questionType;
    String content;
    BigDecimal points;
    Integer orderIndex;
    List<QuizQuestionOptionResponse> options;
}
