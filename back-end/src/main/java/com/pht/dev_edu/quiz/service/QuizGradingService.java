package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.quiz.dto.request.GradeEssayRequest;
import com.pht.dev_edu.quiz.dto.response.AttemptResultResponse;
import com.pht.dev_edu.quiz.dto.response.SubmitAttemptResponse;

import java.util.Set;
import java.util.UUID;

public interface QuizGradingService {
    CustomPaging<SubmitAttemptResponse> getPendingEssayAttempts(UUID quizId, String nextCursor, String graderUsername, Set<String> authorities);

    AttemptResultResponse gradeEssayAnswer(UUID attemptId, UUID questionId, GradeEssayRequest request, String graderUsername, Set<String> authorities);
}
