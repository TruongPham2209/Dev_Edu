package com.pht.dev_edu.quiz.dto.engine;

import com.pht.dev_edu.quiz.dto.enums.QuestionDifficulty;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GeneratedQuestionContract {
    QuestionType questionType;
    QuestionDifficulty difficulty;
    String content;
    BigDecimal points;
    List<OptionContract> options;
    String explanation;
    UUID sourceChunkId;
    String sourceSection;
    Integer sourcePage;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class OptionContract {
        String optionText;
        Boolean isCorrect;
    }
}
