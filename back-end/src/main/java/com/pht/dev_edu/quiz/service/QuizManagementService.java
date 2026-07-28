package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.*;
import com.pht.dev_edu.quiz.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface QuizManagementService {
    QuizResponse createQuiz(QuizRequest request, String username);

    QuizResponse updateQuiz(UUID quizId, QuizRequest request, String username);

    QuizTypeConfigResponse configureTypeConfig(UUID quizId, QuizTypeConfigRequest request, String username);

    List<QuizTypeConfigResponse> getTypeConfigs(UUID quizId);

    QuizQuestionResponse addQuestion(UUID quizId, QuizQuestionRequest request, String username);

    QuizQuestionResponse updateQuestion(UUID quizId, UUID questionId, QuizQuestionRequest request, String username);

    void deleteQuestion(UUID quizId, UUID questionId, String username);

    QuizResponse submitQuizForApproval(UUID quizId, String username);

    QuizResponse reviewQuiz(UUID quizId, QuizReviewRequest request, String username);

    QuizDetailResponse getQuizDetail(UUID quizId);

    Page<QuizResponse> getQuizzesByCourse(UUID courseId, Pageable pageable);

    Page<QuizResponse> getPendingQuizzes(Pageable pageable);
}
