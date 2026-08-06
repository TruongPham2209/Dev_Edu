package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.response.QuizDetailResponse;
import com.pht.dev_edu.quiz.entity.QuizEntity;

import java.util.UUID;

public interface QuizService {
    QuizEntity getQuizEntityOrThrow(UUID quizId);

    QuizEntity getQuizEntity(UUID quizId);

    QuizDetailResponse getQuizDetailResponseFromCache(UUID quizId);
}
