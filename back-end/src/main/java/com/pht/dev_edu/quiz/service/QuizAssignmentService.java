package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.CreateAssignmentRequest;
import com.pht.dev_edu.quiz.dto.response.QuizAssignmentResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface QuizAssignmentService {
    QuizAssignmentResponse createAssignment(CreateAssignmentRequest request, String username, Set<String> authorities);

    List<QuizAssignmentResponse> getAssignmentsByQuiz(UUID quizId, String username, Set<String> authorities);

    QuizAssignmentResponse getAssignmentById(UUID assignmentId, String username, Set<String> authorities);

    List<QuizAssignmentResponse> getAssignmentsByCourseId(UUID courseId, String username, Set<String> authorities);
}
