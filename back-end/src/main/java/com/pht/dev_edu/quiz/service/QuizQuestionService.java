package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.QuizQuestionRequest;
import com.pht.dev_edu.quiz.dto.response.QuizQuestionResponse;

import java.util.Set;
import java.util.UUID;

public interface QuizQuestionService {
    QuizQuestionResponse addQuestion(UUID quizId, QuizQuestionRequest request, String username, Set<String> authorities);

    QuizQuestionResponse updateQuestion(UUID quizId, UUID questionId, QuizQuestionRequest request, String username, Set<String> authorities);

    void deleteQuestion(UUID quizId, UUID questionId, String username, Set<String> authorities);
}
