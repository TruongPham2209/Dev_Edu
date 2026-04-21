package com.pht.dev_edu.enrollment.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.course.dto.EnrolledCourseProjection;
import com.pht.dev_edu.course.dto.EnrolledCourseResponse;
import com.pht.dev_edu.course.dto.EnrollmentUserProjection;
import com.pht.dev_edu.course.dto.EnrollmentUserResponse;
import com.pht.dev_edu.course.service.CourseService;
import com.pht.dev_edu.enrollment.entity.EnrollmentEntity;
import com.pht.dev_edu.enrollment.mapper.EnrollmentMapper;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class EnrollmentServiceImpl implements EnrollmentService {
    EnrollmentRepository enrollmentRepository;
    EnrollmentMapper enrollmentMapper;
    CourseService courseService;

    @Override
    public EnrolledCourseResponse getEnrollmentInfo(String username, UUID courseId) {
        var enrollment = enrollmentRepository.findEnrolledCoursesByStudentAndCourseId(username, courseId)
                .orElseThrow(() -> {
                    log.error("Enrollment not found for user {} and course ID {}", username, courseId);
                    return new DataNotFoundException("Enrollment not found.");
                });

        return enrollmentMapper.toEnrolledCourseResponse(enrollment);
    }

    @Override
    public CustomPaging<EnrolledCourseResponse> getEnrolledCourses(String username, String nextCursor) {
        var pageable = PageRequest.of(0, 15, Sort.by(Sort.Direction.DESC, "e.enrolled_at", "e.id"));
        var timeCursor = StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);

        var enrollmentPage = enrollmentRepository.findEnrolledCoursesByStudentUsernameAndCursor(username, timeCursor.getId(), timeCursor.getTimeStamp(), pageable);

        return PagingUtils.getPagedWithCursor(
                enrollmentPage,
                enrollmentMapper::toEnrolledCourseResponse,
                EnrolledCourseProjection::getEnrolledAt,
                EnrolledCourseProjection::getId
        );
    }

    @Override
    public CustomPaging<EnrollmentUserResponse> getEnrolledUsers(UUID courseId, String nextCursor) {
        var pageable = PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "e.enrolled_at", "e.id"));
        var timeCursor = StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);

        var enrollmentPage = enrollmentRepository.findEnrolledUsersByCourseIdAndCursor(courseId, timeCursor.getId(), timeCursor.getTimeStamp(), pageable);

        return PagingUtils.getPagedWithCursor(
                enrollmentPage,
                enrollmentMapper::toEnrollmentUserResponse,
                EnrollmentUserProjection::getEnrolledAt,
                EnrollmentUserProjection::getId
        );
    }

    // TODO: Fix buy course flow -> using coupon -> remove cart -> enroll course
    @Override
    @Transactional
    public void enrollUserInCourse(String username, UUID courseId, UUID paymentId) {
        var course = courseService.getCourseById(courseId);
        if (course == null) {
            log.error("Course with ID {} not found for enrollment.", courseId);
            throw new DataNotFoundException("Course not found.");
        }

        if (enrollmentRepository.existsByStudentUsernameAndCourseId(username, courseId)) {
            log.error("User {} is already enrolled in course ID {}.", username, courseId);
            throw new BadRequestException("User is already enrolled in this course.");
        }

        var enrollment = EnrollmentEntity.builder()
                .studentUsername(username)
                .courseId(courseId)
                .paymentId(paymentId)
                .build();
        enrollmentRepository.save(enrollment);
    }
}
