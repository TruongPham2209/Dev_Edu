package com.pht.dev_edu.quiz.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AutosaveRequest {
    @NotNull(message = "Question ID is required")
    UUID questionId;

    String answerText;
    List<UUID> selectedOptionIds;

    @NotNull(message = "clientSeq is required")
    Integer clientSeq;

    @NotBlank(message = "sessionToken is required")
    String sessionToken;
}
