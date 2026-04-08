package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.CourseResponse;

import java.util.UUID;

public interface EnrollmentService {
    Object getEnrollmentInfo(String username, UUID courseId);

    CustomPaging<CourseResponse> getEnrolledCourses(String username, int page, int size);

    CustomPaging<Object> getEnrolledUsers(UUID courseId, int page, int size);

    // Save the enrollment information after payment is successful
    void enrollUserInCourse(String username, UUID courseId);
}
