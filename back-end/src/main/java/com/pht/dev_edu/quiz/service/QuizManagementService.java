package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.dto.request.QuizRequest;
import com.pht.dev_edu.quiz.dto.request.QuizReviewRequest;
import com.pht.dev_edu.quiz.dto.request.QuizTypeConfigRequest;
import com.pht.dev_edu.quiz.dto.response.QuizDetailResponse;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;
import com.pht.dev_edu.quiz.dto.response.QuizTypeConfigResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface QuizManagementService {
    QuizResponse createQuiz(QuizRequest request, String username, Set<String> authorities);

    QuizResponse updateQuiz(UUID quizId, QuizRequest request, String username, Set<String> authorities);

    QuizResponse duplicateQuiz(UUID quizId, String username, Set<String> authorities);

    QuizTypeConfigResponse configureTypeConfig(UUID quizId, QuizTypeConfigRequest request, String username,
            Set<String> authorities);

    List<QuizTypeConfigResponse> getTypeConfigs(UUID quizId, String username, Set<String> authorities);

    void deleteTypeConfigs(UUID quizId, UUID typeConfigId, String username, Set<String> authorities);

    QuizResponse submitQuizForApproval(UUID quizId, String username, Set<String> authorities);

    QuizResponse reviewQuiz(UUID quizId, QuizReviewRequest request, String username);

    QuizDetailResponse getQuizDetail(UUID quizId, String username, Set<String> authorities);

    CustomPaging<QuizResponse> getQuizzesByCourse(UUID courseId, String keyword, QuizStatus status, String nextCursor,
            String username, Set<String> authorities);

    CustomPaging<QuizResponse> getQuizzes(QuizStatus status, String keyword, String nextCursor);
}
