package com.pht.dev_edu.assignment.controller;

import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.FeedbackRequest;
import com.pht.dev_edu.assignment.dto.SubmissionRequest;
import com.pht.dev_edu.assignment.service.AssignmentService;
import com.pht.dev_edu.assignment.service.FeedbackService;
import com.pht.dev_edu.assignment.service.SubmissionService;
import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtil;
import com.pht.dev_edu.common.util.SecurityContextUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("assignmentController")
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class AssignmentController {
    AssignmentService assignmentService;
    FeedbackService feedbackService;
    SubmissionService submissionService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAssignments(@RequestParam UUID lectureId) {
        var username = SecurityContextUtil.getCurrentUsernameForController();
        var authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var assignments = assignmentService.getAssignments(authorities, username, lectureId);
        return ApiUtil.buildSuccessResponse(assignments);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @PostMapping
    public ResponseEntity<ApiResponse> createAssignment(@Valid @RequestBody AssignmentRequest req) {
        var username = SecurityContextUtil.getCurrentUsernameForController();
        var authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var newAssignment = assignmentService.create(authorities, username, req);
        return ApiUtil.buildSuccessResponse(newAssignment);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @DeleteMapping
    public ResponseEntity<ApiResponse> deleteAssignment(@RequestParam UUID assignmentId) {
        var username = SecurityContextUtil.getCurrentUsernameForController();
        var authorities = SecurityContextUtil.getCurrentUserAuthorities();
        assignmentService.delete(authorities, username, assignmentId);
        return ApiUtil.buildSuccessResponse("Assignment deleted successfully");
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<ApiResponse> getFeedbacks(@RequestParam UUID submissionId) {
        var username = SecurityContextUtil.getCurrentUsernameForController();
        var authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var feedbacks = feedbackService.getFeedbacksBySubmission(authorities, username, submissionId);
        return ApiUtil.buildSuccessResponse(feedbacks);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @PostMapping("/feedbacks")
    public ResponseEntity<ApiResponse> createFeedback(@Valid @RequestBody FeedbackRequest req) {
        var username = SecurityContextUtil.getCurrentUsernameForController();
        var authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var newFeedback = feedbackService.create(authorities, username, req);
        return ApiUtil.buildSuccessResponse(newFeedback);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @DeleteMapping("/feedbacks")
    public ResponseEntity<ApiResponse> deleteFeedback(@RequestParam UUID feedbackId) {
        var username = SecurityContextUtil.getCurrentUsernameForController();
        var authorities = SecurityContextUtil.getCurrentUserAuthorities();
        feedbackService.delete(authorities, username, feedbackId);
        return ApiUtil.buildSuccessResponse("Feedback deleted successfully");
    }

    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse> getSubmissions(
            @RequestParam UUID assignmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var username = SecurityContextUtil.getCurrentUsernameForController();
        var authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var submissions = submissionService.getSubmissionsByAssignment(authorities, username, assignmentId, page, size);
        return ApiUtil.buildSuccessResponse(submissions);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @PostMapping("/submissions")
    public ResponseEntity<ApiResponse> createSubmission(@Valid @RequestBody SubmissionRequest req) {
        var username = SecurityContextUtil.getCurrentUsernameForController();
        var newSubmission = submissionService.submit(username, req);
        return ApiUtil.buildSuccessResponse(newSubmission);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LECTURER')")
    @DeleteMapping("/submissions")
    public ResponseEntity<ApiResponse> deleteSubmission(@RequestParam UUID submissionId) {
        var username = SecurityContextUtil.getCurrentUsernameForController();
        submissionService.unSubmit(username, submissionId);
        return ApiUtil.buildSuccessResponse("Submission deleted successfully");
    }
}
