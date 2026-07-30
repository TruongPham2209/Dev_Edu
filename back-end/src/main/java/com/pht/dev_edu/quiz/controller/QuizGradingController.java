package com.pht.dev_edu.quiz.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.quiz.dto.request.GradeEssayRequest;
import com.pht.dev_edu.quiz.service.QuizGradingService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

@RestController("QuizGradingController")
@RequestMapping("/api/v1/quiz-gradings")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizGradingController {
    QuizGradingService gradingService;

    // Get list pending essays to grading by quizId
    @GetMapping("/{quizId}/pending")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")
    public ResponseEntity<ApiResponse> getPendingEssayAttempts(
            @PathVariable UUID quizId,
            @RequestParam(name = "nextCursor", required = false) String nextCursor
    ) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var pageResult = gradingService.getPendingEssayAttempts(quizId, nextCursor, username, authorities);
        return ApiUtils.buildSuccessResponse(pageResult);
    }

    @PostMapping("/attempts/{attemptId}/questions/{questionId}")
    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> gradeEssayAnswer(
            @PathVariable UUID attemptId,
            @PathVariable UUID questionId,
            @Valid @RequestBody GradeEssayRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        var result = gradingService.gradeEssayAnswer(attemptId, questionId, request, username, authorities);
        return ApiUtils.buildSuccessResponse(result);
    }
}
