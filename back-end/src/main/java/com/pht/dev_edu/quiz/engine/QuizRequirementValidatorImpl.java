package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.quiz.dto.enums.QuestionDifficulty;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.request.GenerateQuizFromDocumentRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizRequirementValidatorImpl implements QuizRequirementValidator {

    @Override
    public ValidatedRequirements validateAndNormalize(GenerateQuizFromDocumentRequest request) {
        if (request == null) {
            throw new BadRequestException("Quiz generation request cannot be null.");
        }

        if (request.getCourseId() == null) {
            throw new BadRequestException("Course ID is required.");
        }

        Integer requestedTotal = request.getTotalQuestions();
        if (requestedTotal == null || requestedTotal <= 0) {
            throw new BadRequestException("Total questions count must be greater than 0.");
        }
        if (requestedTotal > 100) {
            throw new BadRequestException("Total questions count cannot exceed 100 per generation job.");
        }

        Map<QuestionType, Integer> typeDist = normalizeTypeDistribution(request.getTypeDistribution(), requestedTotal);
        Map<QuestionDifficulty, Integer> diffDist = normalizeDifficultyDistribution(request.getDifficultyDistribution(),
                requestedTotal);

        return ValidatedRequirements.builder()
                .totalQuestions(requestedTotal)
                .typeDistribution(typeDist)
                .difficultyDistribution(diffDist)
                .build();
    }

    private Map<QuestionType, Integer> normalizeTypeDistribution(Map<QuestionType, Integer> input, int total) {
        Map<QuestionType, Integer> map = new EnumMap<>(QuestionType.class);

        if (input != null && !input.isEmpty()) {
            int sum = 0;
            for (Map.Entry<QuestionType, Integer> entry : input.entrySet()) {
                if (entry.getKey() == null) {
                    throw new BadRequestException("Unsupported or null question type in distribution.");
                }
                int count = entry.getValue() != null ? entry.getValue() : 0;
                if (count < 0) {
                    throw new BadRequestException("Question type count cannot be negative.");
                }
                map.put(entry.getKey(), count);
                sum += count;
            }

            if (sum != total) {
                throw new BadRequestException(String.format(
                        "Question type distribution total (%d) does not match total requested questions (%d).", sum,
                        total));
            }
            return map;
        }

        // Default: Assign all to SINGLE_CHOICE
        map.put(QuestionType.SINGLE_CHOICE, total);
        return map;
    }

    private Map<QuestionDifficulty, Integer> normalizeDifficultyDistribution(Map<QuestionDifficulty, Integer> input,
            int total) {
        Map<QuestionDifficulty, Integer> map = new EnumMap<>(QuestionDifficulty.class);

        if (input != null && !input.isEmpty()) {
            int sum = 0;
            for (Map.Entry<QuestionDifficulty, Integer> entry : input.entrySet()) {
                if (entry.getKey() == null) {
                    throw new BadRequestException("Unsupported or null difficulty in distribution.");
                }
                int count = entry.getValue() != null ? entry.getValue() : 0;
                if (count < 0) {
                    throw new BadRequestException("Difficulty count cannot be negative.");
                }
                map.put(entry.getKey(), count);
                sum += count;
            }

            if (sum != total) {
                throw new BadRequestException(String.format(
                        "Difficulty distribution total (%d) does not match total requested questions (%d).", sum,
                        total));
            }
            return map;
        }

        // Default difficulty: 40% EASY, 40% MEDIUM, 20% HARD
        int easy = (int) Math.round(total * 0.40);
        int medium = (int) Math.round(total * 0.40);
        int hard = total - easy - medium;

        if (hard < 0) {
            hard = 0;
            medium = total - easy;
        }

        map.put(QuestionDifficulty.EASY, easy);
        map.put(QuestionDifficulty.MEDIUM, medium);
        map.put(QuestionDifficulty.HARD, hard);
        return map;
    }
}
