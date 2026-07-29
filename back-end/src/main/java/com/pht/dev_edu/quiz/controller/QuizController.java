package com.pht.dev_edu.quiz.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.quiz.dto.request.QuizRequest;
import com.pht.dev_edu.quiz.dto.request.QuizReviewRequest;
import com.pht.dev_edu.quiz.dto.request.QuizTypeConfigRequest;
import com.pht.dev_edu.quiz.service.QuizManagementService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

@RestController("QuizController")
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizController {
    QuizManagementService quizManagementService;

    // Create new quiz with DRAFT status
    @PostMapping
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> createQuiz(@Valid @RequestBody QuizRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = quizManagementService.createQuiz(request, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Update quiz information (only if quiz is in DRAFT status)
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> updateQuiz(@PathVariable("id") UUID quizId,
                                                  @Valid @RequestBody QuizRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = quizManagementService.updateQuiz(quizId, request, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getQuizDetail(@PathVariable("id") UUID quizId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = quizManagementService.getQuizDetail(quizId, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getQuizzesByCourse(
            @PathVariable("courseId") UUID courseId,
            @RequestParam(name = "nextCursor") String nextCursor) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var pageResult = quizManagementService.getQuizzesByCourse(courseId, nextCursor, username,  authorities);
        return ApiUtils.buildSuccessResponse(pageResult);
    }

    // Config quiz structure
    @PostMapping("/{id}/type-configs")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> configureTypeConfig(@PathVariable("id") UUID quizId,
                                                           @Valid @RequestBody QuizTypeConfigRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = quizManagementService.configureTypeConfig(quizId, request, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Get config quiz structure
    @GetMapping("/{id}/type-configs")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getTypeConfigs(@PathVariable("id") UUID quizId) {
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = quizManagementService.getTypeConfigs(quizId, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Pending quiz for approval
    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> submitQuizForApproval(@PathVariable("id") UUID quizId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = quizManagementService.submitQuizForApproval(quizId, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> getPendingQuizzes(
            @RequestParam(name = "nextCursor") String nextCursor) {
        var pageResult = quizManagementService.getPendingQuizzes(nextCursor);
        return ApiUtils.buildSuccessResponse(pageResult);
    }

    // Review quiz (APPROVED or REJECTED)
    @PostMapping("/{id}/review")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> reviewQuiz(@PathVariable("id") UUID quizId,
                                                  @Valid @RequestBody QuizReviewRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = quizManagementService.reviewQuiz(quizId, request, username);
        return ApiUtils.buildSuccessResponse(result);
    }
}
