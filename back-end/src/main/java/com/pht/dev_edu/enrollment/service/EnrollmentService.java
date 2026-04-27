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

    void enrollUserInCourse(String username, List<UUID> courseIds, UUID paymentId);
}
