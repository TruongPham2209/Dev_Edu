package com.pht.dev_edu.quiz.dto.engine;

import com.pht.dev_edu.quiz.dto.enums.QuestionDifficulty;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class QuestionSlot {
    int slotIndex;
    QuestionType questionType;
    QuestionDifficulty difficulty;
    String targetTopic;
    List<UUID> targetChunkIds;
    int attemptCount;
    boolean isAccepted;
}
