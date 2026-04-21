package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.EnrolledCourseResponse;
import com.pht.dev_edu.course.dto.EnrollmentUserResponse;

import java.util.UUID;

public interface EnrollmentService {
    EnrolledCourseResponse getEnrollmentInfo(String username, UUID courseId);

    CustomPaging<EnrolledCourseResponse> getEnrolledCourses(String username, String nextCursor);

    CustomPaging<EnrollmentUserResponse> getEnrolledUsers(UUID courseId, String nextCursor);

    // Save the enrollment information after payment is successful
    void enrollUserInCourse(String username, UUID courseId, UUID paymentId);
}
