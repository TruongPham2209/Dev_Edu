package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.QuestionSlot;
import com.pht.dev_edu.quiz.dto.engine.QuizPlan;
import com.pht.dev_edu.quiz.dto.enums.QuestionDifficulty;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizPlannerServiceImpl implements QuizPlannerService {

    @Override
    public QuizPlan createPlan(
            UUID courseId,
            UUID documentId,
            QuizRequirementValidator.ValidatedRequirements requirements,
            int usableCapacity,
            List<DocumentKnowledgeChunkEntity> eligibleChunks,
            String targetTopic) {

        int planSize = Math.min(requirements.getTotalQuestions(), Math.max(1, usableCapacity));
        log.info("Creating quiz plan with {} question slots (requested={}, capacity={})",
                planSize, requirements.getTotalQuestions(), usableCapacity);

        List<QuestionType> typeList = expandDistribution(requirements.getTypeDistribution(), planSize);
        List<QuestionDifficulty> diffList = expandDistribution(requirements.getDifficultyDistribution(), planSize);

        List<QuestionSlot> slots = new ArrayList<>(planSize);
        int chunkCount = eligibleChunks != null ? eligibleChunks.size() : 0;

        for (int i = 0; i < planSize; i++) {
            QuestionType type = typeList.get(i % typeList.size());
            QuestionDifficulty diff = diffList.get(i % diffList.size());

            List<UUID> assignedChunkIds = new ArrayList<>();
            if (chunkCount > 0) {
                DocumentKnowledgeChunkEntity primaryChunk = eligibleChunks.get(i % chunkCount);
                assignedChunkIds.add(primaryChunk.getId());
                // Add adjacent chunk for broader context if available
                if (chunkCount > 1) {
                    DocumentKnowledgeChunkEntity secondaryChunk = eligibleChunks.get((i + 1) % chunkCount);
                    assignedChunkIds.add(secondaryChunk.getId());
                }
            }

            QuestionSlot slot = QuestionSlot.builder()
                    .slotIndex(i + 1)
                    .questionType(type)
                    .difficulty(diff)
                    .targetTopic(targetTopic != null && !targetTopic.isBlank() ? targetTopic : "Course Document Knowledge")
                    .targetChunkIds(assignedChunkIds)
                    .attemptCount(0)
                    .isAccepted(false)
                    .build();

            slots.add(slot);
        }

        return QuizPlan.builder()
                .courseId(courseId)
                .documentId(documentId)
                .requestedTotal(requirements.getTotalQuestions())
                .usableCapacity(usableCapacity)
                .slots(slots)
                .build();
    }

    private <T> List<T> expandDistribution(Map<T, Integer> distMap, int targetTotal) {
        List<T> result = new ArrayList<>();
        if (distMap == null || distMap.isEmpty()) return result;

        for (Map.Entry<T, Integer> entry : distMap.entrySet()) {
            int count = entry.getValue();
            for (int c = 0; c < count && result.size() < targetTotal; c++) {
                result.add(entry.getKey());
            }
        }

        // If targetTotal < original sum due to capacity cap, fill remaining
        if (result.isEmpty()) {
            result.add(distMap.keySet().iterator().next());
        }

        while (result.size() < targetTotal) {
            result.add(result.get(result.size() % distMap.size()));
        }

        return result;
    }
}
