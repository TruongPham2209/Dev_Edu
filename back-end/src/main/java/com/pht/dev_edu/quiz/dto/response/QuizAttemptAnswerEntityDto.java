package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAttemptAnswerEntityDto {
    UUID questionId;
    QuestionType questionType;
    String answerText;
    List<UUID> selectedOptionIds;
    Integer autosaveVersion;
    LocalDateTime lastSavedAt;
}
