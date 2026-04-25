package com.pht.dev_edu.enrollment.controller;

import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.enrollment.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class EnrollmentController {
    EnrollmentService enrollmentService;

    @PreAuthorize("hasAuthority('STUDENT')")
    @GetMapping
    public ResponseEntity<?> getEnrolledCourses(
            @RequestParam(required = false) String nextCursor
    ) {
        String username = SecurityContextUtils.getCurrentUsernameForController();
        var enrolledCourses = enrollmentService.getEnrolledCourses(username, nextCursor);
        return ApiUtils.buildSuccessResponse(enrolledCourses);
    }

    @PreAuthorize("hasAuthority('LECTURER')")
    @GetMapping("/assigned-courses")
    public ResponseEntity<?> getAssignedCourses(
            @RequestParam(required = false) String nextCursor
    ) {
        String lecturerUsername = SecurityContextUtils.getCurrentUsernameForController();
        var assignedCourses = enrollmentService.findCoursesAssignedToLecturer(lecturerUsername, nextCursor);
        return ApiUtils.buildSuccessResponse(assignedCourses);
    }

    @PreAuthorize("hasAnyAuthority('LECTURER', 'ADMIN')")
    @GetMapping("/enrolled-users")
    public ResponseEntity<?> getEnrolledUsers(
            @RequestParam UUID courseId,
            @RequestParam(required = false) String nextCursor
    ) {
        var enrolledUsers = enrollmentService.getEnrolledUsers(courseId, nextCursor);
        return ApiUtils.buildSuccessResponse(enrolledUsers);
    }
}
