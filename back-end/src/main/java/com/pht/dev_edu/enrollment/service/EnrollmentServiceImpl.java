package com.pht.dev_edu.enrollment.service;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.course.repo.CourseRepository;
import com.pht.dev_edu.enrollment.dto.EnrolledCourseProjection;
import com.pht.dev_edu.enrollment.dto.EnrolledCourseResponse;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserProjection;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserResponse;
import com.pht.dev_edu.enrollment.mapper.EnrollmentMapper;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class EnrollmentServiceImpl implements EnrollmentService {
    CourseRepository courseRepository;
    EnrollmentRepository enrollmentRepository;
    EnrollmentMapper enrollmentMapper;

    @Override
    public CustomPaging<EnrolledCourseResponse> getEnrolledCourses(String username, String nextCursor) {
        var pageable = buildCoursePageable();
        var timeCursor = resolveTimeStampCursor(nextCursor);

        // Course info + enrollment info (enrolledAt) + amount paid (if any)
        var enrollmentPage = enrollmentRepository.findEnrolledCoursesByStudentUsernameAndCursor(username, timeCursor.getId(), timeCursor.getTimeStamp(), pageable);

        return PagingUtils.getPagedWithCursor(
                enrollmentPage,
                enrollmentMapper::toEnrolledCourseResponse,
                EnrolledCourseProjection::getEnrolledAt,
                EnrolledCourseProjection::getId,
                pageable.getPageSize() - 1
        );
    }

    @Override
    public CustomPaging<EnrolledCourseResponse> findCoursesAssignedToLecturer(String lecturerUsername, String nextCursor) {
        var pageable = buildCoursePageable();
        var timeCursor = resolveTimeStampCursor(nextCursor);

        // Only need course info, can ignore enrollment info
        var enrollmentPage = enrollmentRepository.findCoursesAssignedToLecturerByCursor(lecturerUsername, timeCursor.getId(), timeCursor.getTimeStamp(), pageable);
        return PagingUtils.getPagedWithCursor(
                enrollmentPage,
                enrollmentMapper::toEnrolledCourseResponse,
                EnrolledCourseProjection::getEnrolledAt,
                EnrolledCourseProjection::getId,
                pageable.getPageSize() - 1
        );
    }

    private Pageable buildCoursePageable() {
        return PageRequest.of(0, 16);
    }

    private TimeStampCursor resolveTimeStampCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }

    @Override
    public CustomPaging<EnrollmentUserResponse> getEnrolledUsers(UUID courseId, String nextCursor) {
        var pageable = PageRequest.of(0, 20);
        var timeCursor = StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);

        var enrollmentPage = enrollmentRepository.findEnrolledUsersByCourseIdAndCursor(courseId, timeCursor.getId(), timeCursor.getTimeStamp(), pageable);

        return PagingUtils.getPagedWithCursor(
                enrollmentPage,
                enrollmentMapper::toEnrollmentUserResponse,
                EnrollmentUserProjection::getEnrolledAt,
                EnrollmentUserProjection::getId,
                pageable.getPageSize() - 1
        );
    }

    @Override
    @Transactional
    public void enrollUserInCourse(String username, List<UUID> courseIds, UUID paymentId) {
        var activeIds = courseRepository.findActiveIdsByIdIn(courseIds);
        if (activeIds.isEmpty()) {
            log.warn("None of the provided course IDs are active: {}", courseIds);
            throw new DataNotFoundException("No active courses found for the provided IDs.");
        }

        for (UUID courseId : activeIds) {
            var id = UuidCreator.getTimeOrderedEpoch();
            enrollmentRepository.insertWithoutConstraintCheck(id, username, courseId, paymentId);
        }
    }
}
