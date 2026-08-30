package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.GeneratedQuestionContract;
import com.pht.dev_edu.quiz.dto.enums.ValidationFailureReason;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

/**
 * Multi-stage quality validation pipeline interface for LLM-generated questions.
 * Enforces JSON schema validity, answer unambiguity, factual grounding against source context,
 * and semantic deduplication against previously generated questions and the question bank.
 */
public interface QuestionValidationPipeline {

    /**
     * Represents the outcome of a question validation check.
     */
    @Getter
    @Builder
    class ValidationResult {
        boolean isPassed;
        ValidationFailureReason failureReason;
        String message;
    }

    /**
     * Validates all quality criteria for a newly generated question.
     *
     * @param question             the generated {@link GeneratedQuestionContract} from LLM.
     * @param sourceContextText    the source document context used for grounding verification.
     * @param acceptedJobQuestions the list of already accepted questions in the current job (for internal deduplication).
     * @param courseId             the UUID of the course (for repository-level deduplication).
     * @return the {@link ValidationResult} indicating pass/fail status and failure details.
     */
    ValidationResult validateQuestion(
            GeneratedQuestionContract question,
            String sourceContextText,
            List<GeneratedQuestionContract> acceptedJobQuestions,
            UUID courseId
    );
}
