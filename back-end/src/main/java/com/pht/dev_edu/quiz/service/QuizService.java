package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.response.QuizDetailResponse;
import com.pht.dev_edu.quiz.entity.QuizEntity;

import java.util.UUID;

/**
 * Internal service for resolving quiz entities and accessing cached quiz data.
 */
public interface QuizService {

    /**
     * Retrieves a quiz entity by ID or throws DataNotFoundException if not found or deleted.
     *
     * @param quizId the UUID of the quiz.
     * @return the {@link QuizEntity}.
     */
    QuizEntity getQuizEntityOrThrow(UUID quizId);

    /**
     * Retrieves a quiz entity by ID (returns null if not found).
     *
     * @param quizId the UUID of the quiz.
     * @return the {@link QuizEntity} or null.
     */
    QuizEntity getQuizEntity(UUID quizId);

    /**
     * Retrieves quiz detail directly from Redis cache.
     *
     * @param quizId the UUID of the quiz.
     * @return the cached {@link QuizDetailResponse}.
     */
    QuizDetailResponse getQuizDetailResponseFromCache(UUID quizId);
}
