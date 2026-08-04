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

import java.util.Set;
import java.util.UUID;

@RestController("QuizAssignmentController")
@RequestMapping("/api/v1/quiz-assignments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizAssignmentController {
    QuizAssignmentService assignmentService;

    // Create assignment for quiz
    @PostMapping
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> createAssignment(@Valid @RequestBody CreateAssignmentRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = assignmentService.createAssignment(request, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> deleteAssignment(@PathVariable UUID id) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        assignmentService.deleteAssignment(id, username, authorities);
        return ApiUtils.buildSuccessResponse("Assignment has been deleted");
    }

    // Get assignment by quiz
    @GetMapping("/quiz/{quizId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getAssignmentsByQuiz(@PathVariable UUID quizId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = assignmentService.getAssignmentsByQuiz(quizId, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Get assignment detail
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getAssignmentById(@PathVariable UUID id) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = assignmentService.getAssignmentById(id, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Student get all assignment by course
    @GetMapping
    @PreAuthorize("hasAnyAuthority('STUDENT')")
    public ResponseEntity<ApiResponse> getAssignmentsByCourseId(@RequestParam UUID courseId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = assignmentService.getAssignmentsByCourseId(courseId, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }
}
