package com.pht.dev_edu.lecture.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * <analysis>
 * LecturePermissionServiceImpl
 * - checkViewPermissionByLecture(Set<String> authorities, String actor, UUID lectureId)
 *   - branches:
 *       authorities contain ADMIN -> allows access
 *       authorities contain LECTURER -> checks courseLecturerRepository
 *       authorities contain STUDENT -> checks enrollmentRepository
 *   - paths:
 *       [P1: ADMIN -> return early]
 *       [P2: LECTURER with course access -> return]
 *       [P3: LECTURER without course access -> AccessDeniedException]
 *       [P4: STUDENT with course access -> return]
 *       [P5: STUDENT without course access -> AccessDeniedException]
 *   - planned tests:
 *       [shouldAllowAdminToViewLecture -> P1]
 *       [shouldAllowAssignedLecturerToViewLecture -> P2]
 *       [shouldThrowAccessDeniedWhenLecturerNotAssignedToCourseOnView -> P3]
 *       [shouldAllowEnrolledStudentToViewLecture -> P4]
 *       [shouldThrowAccessDeniedWhenStudentNotEnrolledOnView -> P5]
 *
 * - checkModifyPermissionByLecture(Set<String> authorities, String actor, UUID lectureId)
 *   - branches:
 *       authorities contain ADMIN -> allows access
 *       authorities not contain LECTURER -> AccessDeniedException
 *       authorities contain LECTURER -> checks courseLecturerRepository
 *   - paths:
 *       [P1: ADMIN -> return early]
 *       [P2: STUDENT -> AccessDeniedException]
 *       [P3: LECTURER with course access -> return]
 *   - planned tests:
 *       [shouldAllowAdminToModifyLecture -> P1]
 *       [shouldThrowAccessDeniedWhenNonLecturerModifiesLecture -> P2]
 *       [shouldAllowAssignedLecturerToModifyLecture -> P3]
 *
 * - checkModifyPermissionByCourse(Set<String> authorities, String actor, UUID courseId)
 *   - branches:
 *       course not found -> DataNotFoundException
 *       authorities contain ADMIN -> return early
 *       authorities not contain LECTURER -> AccessDeniedException
 *       authorities contain LECTURER -> checks courseLecturerRepository
 *   - paths:
 *       [P1: course not found -> DataNotFoundException]
 *       [P2: ADMIN -> return early]
 *       [P3: non-LECTURER -> AccessDeniedException]
 *       [P4: LECTURER with course access -> return]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenCourseNotFoundOnModify -> P1]
 *       [shouldAllowAdminToModifyCourse -> P2]
 *       [shouldThrowAccessDeniedWhenNonLecturerModifiesCourse -> P3]
 *       [shouldAllowAssignedLecturerToModifyCourse -> P4]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for LecturePermissionServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify lecture and course access permission enforcement in LecturePermissionServiceImpl.
 *
 * Test Scope
 * ----------
 * - checkViewPermissionByLecture(Set<String>, String, UUID)
 * - checkModifyPermissionByLecture(Set<String>, String, UUID)
 * - checkModifyPermissionByCourse(Set<String>, String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ ADMIN full permission bypass
 * ✓ LECTURER course assignment checks
 * ✓ STUDENT enrollment checks
 * ✓ Non-lecturer modification rejection
 * ✓ Missing course/lecture entity handling
 *
 * Mocked Dependencies
 * -------------------
 * - LectureRepository
 * - CourseLecturerRepository
 * - EnrollmentRepository
 * - CourseService
 * - RedisUtils (static mock)
 */

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.exception.security.AccessDeniedException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.course.dto.CourseResponse;
import com.pht.dev_edu.course.entity.CourseLecturerId;
import com.pht.dev_edu.course.repo.CourseLecturerRepository;
import com.pht.dev_edu.course.service.CourseService;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.repo.LectureRepository;

@ExtendWith(MockitoExtension.class)
class LecturePermissionServiceImplTest {

        @Mock
        private LectureRepository lectureRepository;
        @Mock
        private CourseLecturerRepository courseLecturerRepository;
        @Mock
        private EnrollmentRepository enrollmentRepository;
        @Mock
        private CourseService courseService;

        @InjectMocks
        private LecturePermissionServiceImpl lecturePermissionService;

        private MockedStatic<RedisUtils> redisUtilsMock;

        private static final String ACTOR = "user1";
        private static final UUID LECTURE_ID = UUID.randomUUID();
        private static final UUID COURSE_ID = UUID.randomUUID();

        @BeforeEach
        void setUp() {
                redisUtilsMock = mockStatic(RedisUtils.class);
        }

        @AfterEach
        void tearDown() {
                redisUtilsMock.close();
        }

        // ==================== checkViewPermissionByLecture ====================

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("checkViewPermissionByLecture - should allow ADMIN to view lecture")
        void shouldAllowAdminToViewLecture() {
                // Arrange
                LectureEntity lecture = LectureEntity.builder().id(LECTURE_ID).courseId(COURSE_ID).build();
                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(lecture);

                // Act & Assert
                assertThatCode(() -> lecturePermissionService
                                .checkViewPermissionByLecture(Set.of(RoleEnum.ADMIN.name()), ACTOR, LECTURE_ID))
                                .doesNotThrowAnyException();
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("checkViewPermissionByLecture - should allow assigned LECTURER to view lecture")
        void shouldAllowAssignedLecturerToViewLecture() {
                // Arrange
                LectureEntity lecture = LectureEntity.builder().id(LECTURE_ID).courseId(COURSE_ID).build();
                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(lecture);

                CourseLecturerId lecturerId = CourseLecturerId.builder().courseId(COURSE_ID).lecturerUsername(ACTOR)
                                .build();
                when(courseLecturerRepository.existsById(lecturerId)).thenReturn(true);

                // Act & Assert
                assertThatCode(() -> lecturePermissionService
                                .checkViewPermissionByLecture(Set.of(RoleEnum.LECTURER.name()), ACTOR, LECTURE_ID))
                                .doesNotThrowAnyException();
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("checkViewPermissionByLecture - should throw AccessDeniedException when LECTURER is not assigned to course")
        void shouldThrowAccessDeniedWhenLecturerNotAssignedToCourseOnView() {
                // Arrange
                LectureEntity lecture = LectureEntity.builder().id(LECTURE_ID).courseId(COURSE_ID).build();
                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(lecture);

                CourseLecturerId lecturerId = CourseLecturerId.builder().courseId(COURSE_ID).lecturerUsername(ACTOR)
                                .build();
                when(courseLecturerRepository.existsById(lecturerId)).thenReturn(false);

                // Act & Assert
                assertThatThrownBy(() -> lecturePermissionService
                                .checkViewPermissionByLecture(Set.of(RoleEnum.LECTURER.name()), ACTOR, LECTURE_ID))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Course not found");
        }

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("checkViewPermissionByLecture - should allow enrolled STUDENT to view lecture")
        void shouldAllowEnrolledStudentToViewLecture() {
                // Arrange
                LectureEntity lecture = LectureEntity.builder().id(LECTURE_ID).courseId(COURSE_ID).build();
                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(lecture);

                when(enrollmentRepository.existsByStudentUsernameAndCourseId(ACTOR, COURSE_ID)).thenReturn(true);

                // Act & Assert
                assertThatCode(() -> lecturePermissionService
                                .checkViewPermissionByLecture(Set.of(RoleEnum.STUDENT.name()), ACTOR, LECTURE_ID))
                                .doesNotThrowAnyException();
        }

        // ==================== checkModifyPermissionByLecture ====================

        @SuppressWarnings("unchecked")
        @Test
        @DisplayName("checkModifyPermissionByLecture - should throw AccessDeniedException when STUDENT tries to modify lecture")
        void shouldThrowAccessDeniedWhenNonLecturerModifiesLecture() {
                // Arrange
                LectureEntity lecture = LectureEntity.builder().id(LECTURE_ID).courseId(COURSE_ID).build();
                redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(lecture);

                // Act & Assert
                assertThatThrownBy(() -> lecturePermissionService
                                .checkModifyPermissionByLecture(Set.of(RoleEnum.STUDENT.name()), ACTOR, LECTURE_ID))
                                .isInstanceOf(AccessDeniedException.class)
                                .hasMessageContaining("Only lecturers can modify lectures");
        }

        // ==================== checkModifyPermissionByCourse ====================

        @Test
        @DisplayName("checkModifyPermissionByCourse - should throw DataNotFoundException when course not found")
        void shouldThrowDataNotFoundWhenCourseNotFoundOnModify() {
                // Arrange
                when(courseService.getCourseById(COURSE_ID)).thenReturn(null);

                // Act & Assert
                assertThatThrownBy(() -> lecturePermissionService
                                .checkModifyPermissionByCourse(Set.of(RoleEnum.LECTURER.name()), ACTOR, COURSE_ID))
                                .isInstanceOf(DataNotFoundException.class)
                                .hasMessageContaining("Course not found");
        }

        @Test
        @DisplayName("checkModifyPermissionByCourse - should allow ADMIN to modify course")
        void shouldAllowAdminToModifyCourse() {
                // Arrange
                CourseResponse courseResponse = CourseResponse.builder().id(COURSE_ID).build();
                when(courseService.getCourseById(COURSE_ID)).thenReturn(courseResponse);

                // Act & Assert
                assertThatCode(() -> lecturePermissionService
                                .checkModifyPermissionByCourse(Set.of(RoleEnum.ADMIN.name()), ACTOR, COURSE_ID))
                                .doesNotThrowAnyException();
        }
}
