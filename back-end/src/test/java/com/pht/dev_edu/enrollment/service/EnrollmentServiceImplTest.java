package com.pht.dev_edu.enrollment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

/*
 * <analysis>
 * EnrollmentServiceImpl
 * - getEnrolledCourses(String username, String nextCursor)
 *   - paths:
 *       [P1: get enrolled courses with cursor]
 *   - planned tests:
 *       [shouldGetEnrolledCoursesWithCursor -> P1]
 *
 * - findCoursesAssignedToLecturer(String lecturerUsername, String keyword, UUID categoryId, String nextCursor)
 *   - branches:
 *       categoryId == null -> queries without category
 *       categoryId != null -> queries with category
 *   - paths:
 *       [P1: categoryId is null]
 *       [P2: categoryId is not null]
 *   - planned tests:
 *       [shouldFindCoursesAssignedToLecturerWithoutCategory -> P1]
 *       [shouldFindCoursesAssignedToLecturerWithCategory -> P2]
 *
 * - getEnrolledUsers(UUID courseId, String nextCursor)
 *   - paths:
 *       [P1: get enrolled users with cursor]
 *   - planned tests:
 *       [shouldGetEnrolledUsersWithCursor -> P1]
 *
 * - enrollUserInCourse(String username, List<UUID> courseIds, UUID orderId)
 *   - branches:
 *       activeIds is empty -> DataNotFoundException
 *       activeIds present -> insert for each active course
 *   - paths:
 *       [P1: no active courses found -> DataNotFoundException]
 *       [P2: active courses found -> enrolls successfully]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenNoActiveCoursesFound -> P1]
 *       [shouldEnrollUserInActiveCoursesSuccessfully -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for EnrollmentServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify user enrollment logic and lecturer course assignment in EnrollmentServiceImpl.
 *
 * Test Scope
 * ----------
 * - getEnrolledCourses(String, String)
 * - findCoursesAssignedToLecturer(String, String, UUID, String)
 * - getEnrolledUsers(UUID, String)
 * - enrollUserInCourse(String, List<UUID>, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Fetching student enrolled courses
 * ✓ Lecturer assigned courses lookup (with and without category filter)
 * ✓ Enrolled users pagination
 * ✓ User enrollment validation (missing active courses exception vs success insertion)
 *
 * Mocked Dependencies
 * -------------------
 * - CourseRepository
 * - EnrollmentRepository
 * - EnrollmentMapper
 */

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.course.dto.CourseItemDetailResponse;
import com.pht.dev_edu.course.repo.CourseRepository;
import com.pht.dev_edu.enrollment.dto.EnrolledCourseProjection;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserProjection;
import com.pht.dev_edu.enrollment.dto.EnrollmentUserResponse;
import com.pht.dev_edu.enrollment.mapper.EnrollmentMapper;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceImplTest {

    @Mock
    private CourseRepository courseRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private EnrollmentMapper enrollmentMapper;

    @InjectMocks
    private EnrollmentServiceImpl enrollmentService;

    private static final String USERNAME = "student_user";
    private static final UUID COURSE_ID = UUID.randomUUID();
    private static final UUID CATEGORY_ID = UUID.randomUUID();
    private static final UUID ORDER_ID = UUID.randomUUID();

    @Test
    @DisplayName("getEnrolledCourses - should return paged enrolled courses")
    void shouldGetEnrolledCoursesWithCursor() {
        // Arrange
        EnrolledCourseProjection projection = mock(EnrolledCourseProjection.class);
        PageImpl<EnrolledCourseProjection> page = new PageImpl<>(List.of(projection));

        when(enrollmentRepository.findEnrolledCoursesByStudentUsernameAndCursor(eq(USERNAME), any(), any(),
                any(Pageable.class)))
                .thenReturn(page);

        // Act
        CustomPaging<CourseItemDetailResponse> result = enrollmentService.getEnrolledCourses(USERNAME, null);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("findCoursesAssignedToLecturer - should return courses when categoryId is null")
    void shouldFindCoursesAssignedToLecturerWithoutCategory() {
        // Arrange
        EnrolledCourseProjection projection = mock(EnrolledCourseProjection.class);
        PageImpl<EnrolledCourseProjection> page = new PageImpl<>(List.of(projection));

        when(enrollmentRepository.findCoursesAssignedToLecturerByCursor(eq("lecturer"), eq("java"), any(), any(),
                any(Pageable.class)))
                .thenReturn(page);

        // Act
        CustomPaging<CourseItemDetailResponse> result = enrollmentService.findCoursesAssignedToLecturer("lecturer",
                "java", null, null);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("findCoursesAssignedToLecturer - should return courses when categoryId is provided")
    void shouldFindCoursesAssignedToLecturerWithCategory() {
        // Arrange
        EnrolledCourseProjection projection = mock(EnrolledCourseProjection.class);
        PageImpl<EnrolledCourseProjection> page = new PageImpl<>(List.of(projection));

        when(enrollmentRepository.findCoursesAssignedToLecturerByCursor(eq("lecturer"), eq("java"), eq(CATEGORY_ID),
                any(), any(), any(Pageable.class)))
                .thenReturn(page);

        // Act
        CustomPaging<CourseItemDetailResponse> result = enrollmentService.findCoursesAssignedToLecturer("lecturer",
                "java", CATEGORY_ID, null);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("getEnrolledUsers - should return paged enrolled users")
    void shouldGetEnrolledUsersWithCursor() {
        // Arrange
        EnrollmentUserProjection projection = mock(EnrollmentUserProjection.class);
        PageImpl<EnrollmentUserProjection> page = new PageImpl<>(List.of(projection));

        when(enrollmentRepository.findEnrolledUsersByCourseIdAndCursor(eq(COURSE_ID), any(), any(),
                any(Pageable.class)))
                .thenReturn(page);

        // Act
        CustomPaging<EnrollmentUserResponse> result = enrollmentService.getEnrolledUsers(COURSE_ID, null);

        // Assert
        assertThat(result).isNotNull();
    }

    @Test
    @DisplayName("enrollUserInCourse - should throw DataNotFoundException when no active courses found")
    void shouldThrowDataNotFoundWhenNoActiveCoursesFound() {
        // Arrange
        when(courseRepository.findActiveIdsByIdIn(List.of(COURSE_ID))).thenReturn(List.of());

        // Act & Assert
        assertThatThrownBy(() -> enrollmentService.enrollUserInCourse(USERNAME, List.of(COURSE_ID), ORDER_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("No active courses found for the provided IDs.");
    }

    @Test
    @DisplayName("enrollUserInCourse - should insert enrollments for active courses successfully")
    void shouldEnrollUserInActiveCoursesSuccessfully() {
        // Arrange
        when(courseRepository.findActiveIdsByIdIn(List.of(COURSE_ID))).thenReturn(List.of(COURSE_ID));

        // Act
        enrollmentService.enrollUserInCourse(USERNAME, List.of(COURSE_ID), ORDER_ID);

        // Verify
        verify(enrollmentRepository).insertWithoutConstraintCheck(any(), eq(USERNAME), eq(COURSE_ID), eq(ORDER_ID));
    }
}
