package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.CreateAssignmentRequest;
import com.pht.dev_edu.quiz.dto.response.QuizAssignmentResponse;

import java.util.List;
import java.util.UUID;

public interface QuizAssignmentService {
    QuizAssignmentResponse createAssignment(CreateAssignmentRequest request, String username);

    List<QuizAssignmentResponse> getAssignmentsByQuiz(UUID quizId);

    QuizAssignmentResponse getAssignmentById(UUID assignmentId);
}
