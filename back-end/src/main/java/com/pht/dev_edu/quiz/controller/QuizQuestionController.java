package com.pht.dev_edu.quiz.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.quiz.dto.request.QuizQuestionRequest;
import com.pht.dev_edu.quiz.service.QuizQuestionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

@RestController("QuizQuestionController")
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizQuestionController {
    QuizQuestionService quizQuestionService;

    // Get quiz questions
    @PostMapping("/{id}/questions")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> addQuestion(@PathVariable("id") UUID quizId,
                                                   @Valid @RequestBody QuizQuestionRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = quizQuestionService.addQuestion(quizId, request, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Update quiz question
    @PutMapping("/{id}/questions/{questionId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> updateQuestion(
            @PathVariable("id") UUID quizId,
            @PathVariable UUID questionId,
            @Valid @RequestBody QuizQuestionRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = quizQuestionService.updateQuestion(quizId, questionId, request, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Delete quiz question
    @DeleteMapping("/{id}/questions/{questionId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> deleteQuestion(
            @PathVariable("id") UUID quizId,
            @PathVariable UUID questionId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        quizQuestionService.deleteQuestion(quizId, questionId, username, authorities);
        return ApiUtils.buildSuccessResponse("Question deleted successfully");
    }
}
