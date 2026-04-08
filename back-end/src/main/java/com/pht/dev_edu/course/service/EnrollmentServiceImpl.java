package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.CourseResponse;
import com.pht.dev_edu.course.repo.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class EnrollmentServiceImpl implements EnrollmentService {
    EnrollmentRepository enrollmentRepository;
    CourseService courseService;

    @Override
    public Object getEnrollmentInfo(String username, UUID courseId) {
        return null;
    }

    @Override
    public CustomPaging<CourseResponse> getEnrolledCourses(String username, int page, int size) {
        return null;
    }

    @Override
    public CustomPaging<Object> getEnrolledUsers(UUID courseId, int page, int size) {
        return null;
    }

    @Override
    public void enrollUserInCourse(String username, UUID courseId) {

    }
}
