package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.GenerateQuizRequest;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;

/**
 * Service for automated AI-powered quiz generation.
 */
public interface GenerateQuizService {

    /**
     * Generates a multiple-choice quiz automatically using AI based on topic, question count, and difficulty.
     *
     * @param request  the {@link GenerateQuizRequest} containing topic, description, question count, and difficulty.
     * @param username the username of the instructor or administrator requesting quiz generation.
     * @return the generated {@link QuizResponse}.
     */
    QuizResponse generateQuiz(GenerateQuizRequest request, String username);
}
