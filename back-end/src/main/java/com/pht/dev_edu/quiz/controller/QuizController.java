package com.pht.dev_edu.quiz.controller;

import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.quiz.dto.request.QuizQuestionRequest;
import com.pht.dev_edu.quiz.dto.request.QuizRequest;
import com.pht.dev_edu.quiz.dto.request.QuizReviewRequest;
import com.pht.dev_edu.quiz.dto.request.QuizTypeConfigRequest;
import com.pht.dev_edu.quiz.service.QuizManagementService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController("QuizController")
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizController {
    QuizManagementService quizManagementService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> createQuiz(@Valid @RequestBody QuizRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = quizManagementService.createQuiz(request, username);
        return ApiUtils.buildSuccessResponse(result);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> updateQuiz(@PathVariable("id") UUID quizId,
            @Valid @RequestBody QuizRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = quizManagementService.updateQuiz(quizId, request, username);
        return ApiUtils.buildSuccessResponse(result);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getQuizDetail(@PathVariable("id") UUID quizId) {
        var result = quizManagementService.getQuizDetail(quizId);
        return ApiUtils.buildSuccessResponse(result);
    }

    @GetMapping("/course/{courseId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getQuizzesByCourse(
            @PathVariable("courseId") UUID courseId,
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PagingUtils.getPageable(page, size);
        var pageResult = quizManagementService.getQuizzesByCourse(courseId, pageable);
        return ApiUtils.buildSuccessResponse(new CustomPaging<>(pageResult));
    }

    @PostMapping("/{id}/type-configs")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> configureTypeConfig(@PathVariable("id") UUID quizId,
            @Valid @RequestBody QuizTypeConfigRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = quizManagementService.configureTypeConfig(quizId, request, username);
        return ApiUtils.buildSuccessResponse(result);
    }

    @GetMapping("/{id}/type-configs")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getTypeConfigs(@PathVariable("id") UUID quizId) {
        var result = quizManagementService.getTypeConfigs(quizId);
        return ApiUtils.buildSuccessResponse(result);
    }

    @PostMapping("/{id}/questions")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> addQuestion(@PathVariable("id") UUID quizId,
            @Valid @RequestBody QuizQuestionRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = quizManagementService.addQuestion(quizId, request, username);
        return ApiUtils.buildSuccessResponse(result);
    }

    @PutMapping("/{id}/questions/{questionId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> updateQuestion(
            @PathVariable("id") UUID quizId,
            @PathVariable("questionId") UUID questionId,
            @Valid @RequestBody QuizQuestionRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = quizManagementService.updateQuestion(quizId, questionId, request, username);
        return ApiUtils.buildSuccessResponse(result);
    }

    @DeleteMapping("/{id}/questions/{questionId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> deleteQuestion(
            @PathVariable("id") UUID quizId,
            @PathVariable("questionId") UUID questionId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        quizManagementService.deleteQuestion(quizId, questionId, username);
        return ApiUtils.buildSuccessResponse("Question deleted successfully");
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> submitQuizForApproval(@PathVariable("id") UUID quizId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = quizManagementService.submitQuizForApproval(quizId, username);
        return ApiUtils.buildSuccessResponse(result);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> getPendingQuizzes(
            @RequestParam(name = "page", defaultValue = "1") int page,
            @RequestParam(name = "size", defaultValue = "10") int size) {
        Pageable pageable = PagingUtils.getPageable(page, size);
        var pageResult = quizManagementService.getPendingQuizzes(pageable);
        return ApiUtils.buildSuccessResponse(new CustomPaging<>(pageResult));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ApiResponse> reviewQuiz(@PathVariable("id") UUID quizId,
            @Valid @RequestBody QuizReviewRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = quizManagementService.reviewQuiz(quizId, request, username);
        return ApiUtils.buildSuccessResponse(result);
    }
}
