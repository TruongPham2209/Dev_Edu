package com.pht.dev_edu.quiz.dto.event;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizAutosaveLogEvent {
    UUID attemptId;
    UUID questionId;
    String answerText;
    List<UUID> selectedOptionIds;
    Integer clientSeq;
    String sessionToken;
    LocalDateTime savedAt;
}
