package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class KnowledgeAvailabilityEvaluatorImpl implements KnowledgeAvailabilityEvaluator {

    private static final int MAX_QUESTIONS_PER_CHUNK = 2;

    @Override
    public CapacityOutcome evaluateCapacity(List<DocumentKnowledgeChunkEntity> eligibleChunks, int requestedTotalQuestions) {
        if (eligibleChunks == null || eligibleChunks.isEmpty()) {
            return CapacityOutcome.builder()
                    .status(CapacityStatus.ZERO_KNOWLEDGE)
                    .requestedQuestions(requestedTotalQuestions)
                    .usableCapacity(0)
                    .reason("No eligible document knowledge chunks available for question generation.")
                    .build();
        }

        int totalWords = eligibleChunks.stream()
                .mapToInt(c -> c.getContent().split("\\s+").length)
                .sum();

        // Estimate capacity based on chunk count and content density
        int maxEstimatedFromChunks = eligibleChunks.size() * MAX_QUESTIONS_PER_CHUNK;
        int maxEstimatedFromWords = Math.max(1, totalWords / 150);
        int usableCapacity = Math.max(1, Math.min(maxEstimatedFromChunks, maxEstimatedFromWords));

        log.info("Knowledge availability capacity evaluation: totalChunks={}, totalWords={}, estimatedCapacity={}, requested={}",
                eligibleChunks.size(), totalWords, usableCapacity, requestedTotalQuestions);

        if (usableCapacity >= requestedTotalQuestions) {
            return CapacityOutcome.builder()
                    .status(CapacityStatus.ENOUGH_KNOWLEDGE)
                    .requestedQuestions(requestedTotalQuestions)
                    .usableCapacity(usableCapacity)
                    .reason("Sufficient knowledge available for requested " + requestedTotalQuestions + " questions.")
                    .build();
        } else {
            return CapacityOutcome.builder()
                    .status(CapacityStatus.INSUFFICIENT_KNOWLEDGE)
                    .requestedQuestions(requestedTotalQuestions)
                    .usableCapacity(usableCapacity)
                    .reason("Source document can only support approximately " + usableCapacity + " high-quality questions out of " + requestedTotalQuestions + " requested. Fallback strategy will generate up to usable capacity.")
                    .build();
        }
    }
}
