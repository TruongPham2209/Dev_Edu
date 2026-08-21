package com.pht.dev_edu.quiz.dto.request;

import java.util.Map;
import java.util.UUID;

import com.pht.dev_edu.quiz.dto.enums.DocumentSourceType;
import com.pht.dev_edu.quiz.dto.enums.QuestionDifficulty;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GenerateQuizFromDocumentRequest {
    UUID quizId;
    UUID courseId;

    DocumentSourceType sourceType;
    UUID documentId;

    @Size(max = 500, message = "Document object key cannot exceed 500 characters")
    String documentObjectKey;

    @Size(max = 255, message = "Document name cannot exceed 255 characters")
    String documentName;

    Boolean saveDocument;

    @Size(max = 255, message = "Title cannot exceed 255 characters")
    String title;

    @Size(max = 255, message = "Topic cannot exceed 255 characters")
    String topic;

    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    String description;

    @Min(value = 1, message = "Total questions must be at least 1")
    @Max(value = 100, message = "Total questions cannot exceed 100")
    Integer totalQuestions;

    Map<QuestionType, Integer> typeDistribution;
    Map<QuestionDifficulty, Integer> difficultyDistribution;

    Boolean overrideCourseConfig;
}
