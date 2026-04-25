package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.enrollment.dto.EnrolledCourseResponse;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserResponse;

import java.util.List;
import java.util.UUID;

public interface EnrollmentService {
    CustomPaging<EnrolledCourseResponse> getEnrolledCourses(String username, String nextCursor);

    CustomPaging<EnrolledCourseResponse> findCoursesAssignedToLecturer(String lecturerUsername, String nextCursor);

    CustomPaging<EnrollmentUserResponse> getEnrolledUsers(UUID courseId, String nextCursor);

    // Save the enrollment information after payment is successful
    void enrollUserInCourse(String username, List<UUID> courseIds, UUID paymentId);

    // TODO: Add method get courses in cart
}
