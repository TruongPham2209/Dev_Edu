package com.pht.dev_edu.quiz.engine;

import com.pht.dev_edu.quiz.dto.engine.QuizPlan;
import com.pht.dev_edu.quiz.entity.DocumentKnowledgeChunkEntity;

import java.util.List;
import java.util.UUID;

/**
 * Service for creating structured quiz generation plans (Quiz Plan).
 * Generates an ordered list of question slots with type distribution, difficulty, points, and target chunk assignments.
 */
public interface QuizPlannerService {

    /**
     * Creates a quiz generation plan specifying question slots to generate.
     *
     * @param courseId       the UUID of the course.
     * @param documentId     the UUID of the source document.
     * @param requirements   the normalized {@link QuizRequirementValidator.ValidatedRequirements}.
     * @param usableCapacity the maximum question capacity that can be generated.
     * @param eligibleChunks the list of eligible {@link DocumentKnowledgeChunkEntity} chunks.
     * @param targetTopic    the target topic string (if specified).
     * @return the {@link QuizPlan} containing question slots ready for content generation.
     */
    QuizPlan createPlan(
            UUID courseId,
            UUID documentId,
            QuizRequirementValidator.ValidatedRequirements requirements,
            int usableCapacity,
            List<DocumentKnowledgeChunkEntity> eligibleChunks,
            String targetTopic
    );
}
