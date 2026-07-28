package com.pht.dev_edu.quiz.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.quiz.dto.request.CreateAssignmentRequest;
import com.pht.dev_edu.quiz.service.QuizAssignmentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("QuizAssignmentController")
@RequestMapping("/api/v1/quiz-assignments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizAssignmentController {
    QuizAssignmentService assignmentService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> createAssignment(@Valid @RequestBody CreateAssignmentRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = assignmentService.createAssignment(request, username);
        return ApiUtils.buildSuccessResponse(result);
    }

    @GetMapping("/quiz/{quizId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getAssignmentsByQuiz(@PathVariable("quizId") UUID quizId) {
        var result = assignmentService.getAssignmentsByQuiz(quizId);
        return ApiUtils.buildSuccessResponse(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getAssignmentById(@PathVariable("id") UUID id) {
        var result = assignmentService.getAssignmentById(id);
        return ApiUtils.buildSuccessResponse(result);
    }
}
