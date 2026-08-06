package com.pht.dev_edu.quiz.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizDetailResponse {
    QuizResponse quiz;
    List<QuizTypeConfigResponse> typeConfigs;
    List<QuizQuestionResponse> questions;
}
