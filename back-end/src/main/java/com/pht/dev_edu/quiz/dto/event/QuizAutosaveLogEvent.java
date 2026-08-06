package com.pht.dev_edu.quiz.dto.event;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
    LocalDateTime savedAt;
}
