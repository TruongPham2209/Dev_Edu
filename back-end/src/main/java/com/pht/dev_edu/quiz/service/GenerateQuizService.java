package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.GenerateQuizRequest;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;

public interface GenerateQuizService {
    QuizResponse generateQuiz(GenerateQuizRequest request, String username);
}
