package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AttemptAnswerResultDto {
    UUID questionId;
    QuestionType questionType;
    String questionContent;
    BigDecimal questionPoints;
    String answerText;
    List<UUID> selectedOptionIds;
    Boolean isCorrect;
    BigDecimal awardedPoints;
    String feedback;
    String gradedBy;
    LocalDateTime gradedAt;
    List<QuizQuestionOptionResponse> options;
}
