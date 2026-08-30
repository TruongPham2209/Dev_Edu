package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.enums.QuestionDifficulty;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

/**
 * Validator interface responsible for validating and normalizing quiz generation request parameters
 * (total question quota, question type distribution, and difficulty breakdown).
 */
public interface QuizRequirementValidator {

    /**
     * Holds normalized and validated quiz generation requirements.
     */
    @Getter
    @Builder
    class ValidatedRequirements {
        int totalQuestions;
        Map<QuestionType, Integer> typeDistribution;
        Map<QuestionDifficulty, Integer> difficultyDistribution;
    }

    /**
     * Validates input constraints and normalizes question type and difficulty distributions using defaults if unspecified.
     *
     * @param request the {@link GenerateQuizFromDocumentRequest} payload.
     * @return the {@link ValidatedRequirements} containing sanitized question counts and distributions.
     */
    ValidatedRequirements validateAndNormalize(GenerateQuizFromDocumentRequest request);
}
