package com.pht.dev_edu.quiz.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.quiz.dto.request.AutosaveRequest;
import com.pht.dev_edu.quiz.dto.request.HeartbeatRequest;
import com.pht.dev_edu.quiz.service.QuizAttemptService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

@RestController("QuizAttemptController")
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizAttemptController {
    QuizAttemptService attemptService;

    // Start assignment or resume assignment (update service ten remove endpoint resume)
    @PostMapping("/quiz-assignments/{assignmentId}/start")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse> startAttempt(
            @PathVariable UUID assignmentId,
            @RequestHeader(name = "X-Session-Token", required = false) String sessionTokenHeader,
            @RequestParam(name = "sessionToken", required = false) String sessionTokenParam) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        String sessionToken = sessionTokenHeader != null ? sessionTokenHeader : sessionTokenParam;
        if (sessionToken == null || sessionToken.isBlank()) {
            sessionToken = UUID.randomUUID().toString();
        }
        var result = attemptService.startAttempt(assignmentId, username, sessionToken);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Get student attempt history for an assignment (submitted attempts only)
    @GetMapping("/quiz-assignments/{assignmentId}/my-attempts")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse> getStudentAttemptHistory(@PathVariable UUID assignmentId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = attemptService.getStudentAttemptHistory(assignmentId, username);
        return ApiUtils.buildSuccessResponse(result);
    }


    // Autosave answer
    @PostMapping("/quiz-attempts/{attemptId}/autosave")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse> autosaveAnswer(
            @PathVariable UUID attemptId,
            @Valid @RequestBody AutosaveRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = attemptService.autosaveAnswer(attemptId, request, username);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Submit attempt and auto grade
    @PostMapping("/quiz-attempts/{attemptId}/submit")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse> submitAttempt(@PathVariable UUID attemptId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var result = attemptService.submitAttempt(attemptId, username);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Heartbeat to validate duplicate devices
    @PostMapping("/quiz-attempts/{attemptId}/heartbeat")
    @PreAuthorize("hasAuthority('STUDENT')")
    public ResponseEntity<ApiResponse> heartbeat(
            @PathVariable UUID attemptId,
            @Valid @RequestBody HeartbeatRequest request) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        attemptService.heartbeat(attemptId, request, username);
        return ApiUtils.buildSuccessResponse("Heartbeat acknowledged");
    }

    // Get attempt detail / active state
    @GetMapping("/quiz-attempts/{attemptId}")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getAttemptById(@PathVariable UUID attemptId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();
        boolean isStaff = authorities.contains("LECTURER") || authorities.contains("ADMIN");

        var result = attemptService.getAttemptById(attemptId, username, isStaff);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Get attempt review (student review submitted attempt)
    @GetMapping("/quiz-attempts/{attemptId}/review")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getAttemptReview(@PathVariable UUID attemptId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();
        boolean isStaff = authorities.contains("LECTURER") || authorities.contains("ADMIN");

        var result = attemptService.getAttemptReview(attemptId, username, isStaff);
        return ApiUtils.buildSuccessResponse(result);
    }

    // Get attempt result
    @GetMapping("/quiz-attempts/{attemptId}/result")
    @PreAuthorize("hasAnyAuthority('STUDENT', 'LECTURER', 'ADMIN')")
    public ResponseEntity<ApiResponse> getAttemptResult(@PathVariable UUID attemptId) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtils.getCurrentUserAuthorities();

        boolean isStaff = authorities.contains("LECTURER") || authorities.contains("ADMIN");
        var result = attemptService.getAttemptResult(attemptId, username, isStaff);
        return ApiUtils.buildSuccessResponse(result);
    }
}

