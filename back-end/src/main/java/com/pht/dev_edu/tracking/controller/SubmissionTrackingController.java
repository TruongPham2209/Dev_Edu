package com.pht.dev_edu.tracking.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.ApiUtil;
import com.pht.dev_edu.common.util.SecurityContextUtil;
import com.pht.dev_edu.tracking.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.UUID;

@RestController("submissionTrackingController")
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class SubmissionTrackingController {
    SubmissionService submissionService;

    @GetMapping("/submissions/tracking")
    public ResponseEntity<ApiResponse> getSubmissionsTracking(
            @RequestParam UUID assignmentId,
            @RequestParam(required = false) String studentUsername,
            @RequestParam(defaultValue = "0") int page
    ) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        if (authorities.contains(RoleEnum.STUDENT.name())) {
            studentUsername = username;
        }

        if (studentUsername == null) {
            throw new BadRequestException("Student username is required for non-student users");
        }

        var trackingLogs = submissionService.getSubmissionLogsByAssignmentIdForStudent(authorities, username, studentUsername, assignmentId, page);
        return ApiUtil.buildSuccessResponse(trackingLogs);
    }
}
