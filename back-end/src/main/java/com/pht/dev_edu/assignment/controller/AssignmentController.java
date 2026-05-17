package com.pht.dev_edu.assignment.controller;

import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.FeedbackRequest;
import com.pht.dev_edu.assignment.dto.SubmissionRequest;
import com.pht.dev_edu.assignment.service.AssignmentService;
import com.pht.dev_edu.assignment.service.FeedbackService;
import com.pht.dev_edu.assignment.service.SubmissionService;
import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
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
    public ResponseEntity<ApiResponse> getAssignments(
            @RequestParam(required = false) UUID lectureId,
            @RequestParam(required = false) UUID assignmentId
    ) {
        if (lectureId == null && assignmentId == null) {
            throw new BadRequestException("Either lectureId or assignmentId must be provided");
        }

        var username = SecurityContextUtils.getCurrentUsernameForController();
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();

        if (assignmentId != null) {
            var assignmentDetail = assignmentService.getAssignmentDetail(authorities, username, assignmentId);
            return ApiUtils.buildSuccessResponse(assignmentDetail);
        }

        var assignments = assignmentService.getAssignments(authorities, username, lectureId);
        return ApiUtils.buildSuccessResponse(assignments);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")
    @PostMapping
    public ResponseEntity<ApiResponse> createAssignment(@Valid @RequestBody AssignmentRequest req) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        var newAssignment = assignmentService.create(authorities, username, req);
        return ApiUtils.buildSuccessResponse(newAssignment);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")
    @DeleteMapping
    public ResponseEntity<ApiResponse> deleteAssignment(@RequestParam UUID assignmentId) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        assignmentService.delete(authorities, username, assignmentId);
        return ApiUtils.buildSuccessResponse("Assignment deleted successfully");
    }

    @GetMapping("/feedbacks")
    public ResponseEntity<ApiResponse> getFeedbacks(
            @RequestParam UUID assignmentId,
            @RequestParam (required = false) String studentUsername
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();

        if (authorities.contains(RoleEnum.STUDENT.name())) {
            studentUsername = username;
        }

        var feedbacks = feedbackService.getFeedbacksByAssignment(authorities, username, assignmentId, studentUsername);
        return ApiUtils.buildSuccessResponse(feedbacks);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")
    @PostMapping("/feedbacks")
    public ResponseEntity<ApiResponse> createFeedback(@Valid @RequestBody FeedbackRequest req) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        var newFeedback = feedbackService.create(authorities, username, req);
        return ApiUtils.buildSuccessResponse(newFeedback);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")
    @DeleteMapping("/feedbacks")
    public ResponseEntity<ApiResponse> deleteFeedback(@RequestParam UUID feedbackId) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        feedbackService.delete(authorities, username, feedbackId);
        return ApiUtils.buildSuccessResponse("Feedback deleted successfully");
    }

    @PreAuthorize("hasAnyAuthority('ADMIN', 'LECTURER')")
    @GetMapping("/submissions")
    public ResponseEntity<ApiResponse> getSubmissions(
            @RequestParam UUID assignmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        var submissions = submissionService.getSubmissionsByAssignment(authorities, username, assignmentId, page, size);
        return ApiUtils.buildSuccessResponse(submissions);
    }

    @PostMapping("/submissions")
    public ResponseEntity<ApiResponse> createSubmission(@Valid @RequestBody SubmissionRequest req) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var newSubmission = submissionService.submit(username, req);
        return ApiUtils.buildSuccessResponse(newSubmission);
    }

    @DeleteMapping("/submissions")
    public ResponseEntity<ApiResponse> cancelSubmission(@RequestParam UUID assignmentId) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        submissionService.unSubmit(username, assignmentId);
        return ApiUtils.buildSuccessResponse("Submission deleted successfully");
    }
}
