package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.GradeEssayRequest;
import com.pht.dev_edu.quiz.dto.response.AttemptResultResponse;
import com.pht.dev_edu.quiz.dto.response.SubmitAttemptResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface QuizGradingService {
    Page<SubmitAttemptResponse> getPendingEssayAttempts(Pageable pageable);

    AttemptResultResponse gradeEssayAnswer(UUID attemptId, UUID questionId, GradeEssayRequest request, String graderUsername);
}
