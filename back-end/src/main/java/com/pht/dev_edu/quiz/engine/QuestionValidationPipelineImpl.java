package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.GeneratedQuestionContract;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.ValidationFailureReason;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuestionValidationPipelineImpl implements QuestionValidationPipeline {
    QuizQuestionRepo quizQuestionRepo;

    private static final double SIMILARITY_DUPLICATE_THRESHOLD = 0.80;

    @Override
    public ValidationResult validateQuestion(
            GeneratedQuestionContract question,
            String sourceContextText,
            List<GeneratedQuestionContract> acceptedJobQuestions,
            UUID courseId) {

        // 1. Schema Validation
        if (question == null || question.getContent() == null || question.getContent().trim().length() < 5) {
            return fail(ValidationFailureReason.INVALID_FORMAT, "Question content is missing or too short.");
        }

        // 2. Answer & Option Validation
        if (question.getQuestionType() == QuestionType.SINGLE_CHOICE || question.getQuestionType() == QuestionType.MULTIPLE_CHOICE) {
            List<GeneratedQuestionContract.OptionContract> options = question.getOptions();
            if (options == null || options.size() < 2) {
                return fail(ValidationFailureReason.INVALID_FORMAT, "Choice questions must have at least 2 options.");
            }

            long correctCount = options.stream().filter(o -> Boolean.TRUE.equals(o.getIsCorrect())).count();
            if (question.getQuestionType() == QuestionType.SINGLE_CHOICE && correctCount != 1) {
                return fail(ValidationFailureReason.AMBIGUOUS_ANSWER, "SINGLE_CHOICE question must have exactly 1 correct answer (found " + correctCount + ").");
            }
            if (question.getQuestionType() == QuestionType.MULTIPLE_CHOICE && correctCount < 1) {
                return fail(ValidationFailureReason.AMBIGUOUS_ANSWER, "MULTIPLE_CHOICE question must have at least 1 correct answer.");
            }

            Set<String> optionTexts = new HashSet<>();
            for (GeneratedQuestionContract.OptionContract opt : options) {
                if (opt.getOptionText() == null || opt.getOptionText().isBlank()) {
                    return fail(ValidationFailureReason.INVALID_FORMAT, "Option text cannot be blank.");
                }
                String normalized = opt.getOptionText().trim().toLowerCase();
                if (!optionTexts.add(normalized)) {
                    return fail(ValidationFailureReason.AMBIGUOUS_ANSWER, "Duplicate option choices detected: '" + opt.getOptionText() + "'.");
                }
            }
        }

        // 3. Source Grounding Validation
        if (sourceContextText != null && !sourceContextText.isBlank()) {
            String lowerSource = sourceContextText.toLowerCase();
            String lowerContent = question.getContent().toLowerCase();

            // Extract keywords (words > 4 chars) from question content
            String[] words = lowerContent.replaceAll("[^a-z0-9\\s]", "").split("\\s+");
            long matchedKeywords = 0;
            long totalKeywords = 0;

            for (String w : words) {
                if (w.length() > 4) {
                    totalKeywords++;
                    if (lowerSource.contains(w)) {
                        matchedKeywords++;
                    }
                }
            }

            if (totalKeywords > 0) {
                double matchRatio = (double) matchedKeywords / totalKeywords;
                if (matchRatio < 0.25) {
                    log.warn("Question failed grounding check (keyword match ratio: {}). Content: {}", matchRatio, question.getContent());
                    return fail(ValidationFailureReason.NOT_GROUNDED, "Question content is not sufficiently grounded in the source text evidence.");
                }
            }
        }

        // 4. Duplicate Validation against accepted questions in current job
        if (acceptedJobQuestions != null) {
            for (GeneratedQuestionContract accepted : acceptedJobQuestions) {
                double sim = calculateTextSimilarity(question.getContent(), accepted.getContent());
                if (sim >= SIMILARITY_DUPLICATE_THRESHOLD) {
                    return fail(ValidationFailureReason.DUPLICATE, "Duplicate question detected within current generation job.");
                }
            }
        }

        // 5. Duplicate Validation against existing questions in DB for course
        if (courseId != null) {
            List<QuizQuestionEntity> existingDbQuestions = quizQuestionRepo.findByCourseId(courseId);
            if (existingDbQuestions != null) {
                for (QuizQuestionEntity dbQ : existingDbQuestions) {
                    double sim = calculateTextSimilarity(question.getContent(), dbQ.getContent());
                    if (sim >= SIMILARITY_DUPLICATE_THRESHOLD) {
                        return fail(ValidationFailureReason.DUPLICATE, "Duplicate question detected against existing course question bank.");
                    }
                }
            }
        }

        return ValidationResult.builder()
                .isPassed(true)
                .message("Question passed all validation rules successfully.")
                .build();
    }

    private ValidationResult fail(ValidationFailureReason reason, String message) {
        return ValidationResult.builder()
                .isPassed(false)
                .failureReason(reason)
                .message(message)
                .build();
    }

    private double calculateTextSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;
        String[] words1 = s1.toLowerCase().replaceAll("[^a-z0-9\\s]", "").split("\\s+");
        String[] words2 = s2.toLowerCase().replaceAll("[^a-z0-9\\s]", "").split("\\s+");

        Set<String> set1 = new HashSet<>(List.of(words1));
        Set<String> set2 = new HashSet<>(List.of(words2));

        if (set1.isEmpty() || set2.isEmpty()) return 0.0;

        Set<String> intersection = new HashSet<>(set1);
        intersection.retainAll(set2);

        Set<String> union = new HashSet<>(set1);
        union.addAll(set2);

        return (double) intersection.size() / union.size();
    }
}
