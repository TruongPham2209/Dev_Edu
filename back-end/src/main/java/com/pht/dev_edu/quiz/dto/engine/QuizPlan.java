package com.pht.dev_edu.quiz.dto.engine;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuizPlan {
    UUID courseId;
    UUID documentId;
    int requestedTotal;
    int usableCapacity;
    List<QuestionSlot> slots;
}
