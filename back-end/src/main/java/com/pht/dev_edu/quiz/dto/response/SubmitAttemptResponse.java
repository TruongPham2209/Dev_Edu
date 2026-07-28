package com.pht.dev_edu.quiz.dto.response;

import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SubmitAttemptResponse {
    UUID attemptId;
    AttemptStatus status;
    LocalDateTime submittedAt;
    BigDecimal totalScore;
    BigDecimal maxScore;
}
