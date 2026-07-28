package com.pht.dev_edu.quiz.dto.request;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.UUID;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GenerateQuizRequest {
    UUID courseId;
    String topic;
    Integer numberOfQuestions;
}
