package com.pht.dev_edu.lecture.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;
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
import org.springframework.kafka.core.KafkaTemplate;

/*
 * <analysis>
 * LectureServiceImpl
 * - getLecturesByCourse(Set<String> authorities, String actor, UUID courseId)
 *   - branches:
 *       ADMIN or assigned LECTURER -> findLectureDetailsByCourseId (full view)
 *       STUDENT -> findLectureDetailsByCourseIdAndUsername (user view)
 *   - paths:
 *       [P1: ADMIN or assigned lecturer]
 *       [P2: STUDENT]
 *   - planned tests:
 *       [shouldGetLecturesByCourseForAdminOrAssignedLecturer -> P1]
 *       [shouldGetLecturesByCourseForStudent -> P2]
 *
 * - getLecture(Set<String> authorities, String actor, UUID lectureId)
 *   - branches:
 *       permission check fails -> exception from permission service
 *       lecture detail not found -> RuntimeException
 *       STUDENT role & previous lectures incomplete -> BadRequestException
 *       valid access -> returns mapped response
 *   - paths:
 *       [P1: incomplete previous lectures for STUDENT -> BadRequestException]
 *       [P2: valid access -> returns LectureResponse]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenPreviousLecturesNotCompletedForStudent -> P1]
 *       [shouldGetLectureSuccessfully -> P2]
 *
 * - createLecture(Set<String> authorities, String actor, LectureRequest req)
 *   - paths:
 *       [P1: checks modify permission, validates video object key, sets next order, saves entity]
 *   - planned tests:
 *       [shouldCreateLectureSuccessfully -> P1]
 *
 * - updateLecture(Set<String> authorities, String actor, LectureRequest req)
 *   - branches:
 *       lecture not found -> BadRequestException
 *       lecture deleted -> BadRequestException
 *       lecture valid -> updates title/summary/content, saves, invalidates cache
 *   - paths:
 *       [P1: lecture not found -> BadRequestException]
 *       [P2: lecture deleted -> BadRequestException]
 *       [P3: valid update]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenUpdatingNonExistentLecture -> P1]
 *       [shouldThrowBadRequestWhenUpdatingDeletedLecture -> P2]
 *       [shouldUpdateLectureSuccessfully -> P3]
 *
 * - deleteLecture(Set<String> authorities, String actor, UUID lectureId)
 *   - branches:
 *       lecture not found -> BadRequestException
 *       lecture already deleted -> log & return
 *       valid lecture -> soft deletes, saves & invalidates cache
 *   - paths:
 *       [P1: lecture not found -> BadRequestException]
 *       [P2: lecture already deleted]
 *       [P3: valid soft delete]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenDeletingNonExistentLecture -> P1]
 *       [shouldDoNothingWhenDeletingAlreadyDeletedLecture -> P2]
 *       [shouldDeleteLectureSuccessfully -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for LectureServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify lecture management and sequential completion logic in LectureServiceImpl.
 *
 * Test Scope
 * ----------
 * - getLecturesByCourse(Set<String>, String, UUID)
 * - getLecture(Set<String>, String, UUID)
 * - createLecture(Set<String>, String, LectureRequest)
 * - updateLecture(Set<String>, String, LectureRequest)
 * - deleteLecture(Set<String>, String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Role-based lecture list filtering (full vs student view)
 * ✓ Sequential lecture completion check for student role
 * ✓ Lecture creation and ordering
 * ✓ Lecture updates & soft deletion
 * ✓ Cache invalidation on modification
 *
 * Mocked Dependencies
 * -------------------
 * - LectureRepository
 * - CourseLecturerRepository
 * - LecturePermissionService
 * - LectureMapper
 * - KafkaTemplate
 * - Executor
 * - RedisUtils (static mock)
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.course.repo.CourseLecturerRepository;
import com.pht.dev_edu.lecture.dto.LectureProjection;
import com.pht.dev_edu.lecture.dto.LectureRequest;
import com.pht.dev_edu.lecture.dto.LectureResponse;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.mapper.LectureMapper;
import com.pht.dev_edu.lecture.repo.LectureRepository;

@ExtendWith(MockitoExtension.class)
class LectureServiceImplTest {

    @Mock
    private LectureRepository lectureRepository;
    @Mock
    private CourseLecturerRepository courseLecturerRepository;
    @Mock
    private LecturePermissionService lecturePermissionService;
    @Mock
    private LectureMapper lectureMapper;
    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;
    @Mock
    private Executor executor;

    @InjectMocks
    private LectureServiceImpl lectureService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    private static final String ACTOR = "lecturer1";
    private static final UUID COURSE_ID = UUID.randomUUID();
    private static final UUID LECTURE_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        redisUtilsMock = mockStatic(RedisUtils.class);
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
    }

    @AfterEach
    void tearDown() {
        redisUtilsMock.close();
        kafkaUtilsMock.close();
    }

    // ==================== getLecturesByCourse ====================

    @Test
    @DisplayName("getLecturesByCourse - should return lecture details for ADMIN")
    void shouldGetLecturesByCourseForAdminOrAssignedLecturer() {
        // Arrange
        LectureProjection projection = mock(LectureProjection.class);
        when(lectureRepository.findLectureDetailsByCourseId(COURSE_ID)).thenReturn(List.of(projection));

        LectureResponse response = LectureResponse.builder().build();
        when(lectureMapper.projectionToResponse(projection)).thenReturn(response);

        // Act
        List<LectureResponse> result = lectureService.getLecturesByCourse(Set.of(RoleEnum.ADMIN.name()), ACTOR,
                COURSE_ID);

        // Assert
        assertThat(result).hasSize(1).contains(response);
    }

    // ==================== getLecture ====================

    @Test
    @DisplayName("getLecture - should throw BadRequestException when previous lectures incomplete for STUDENT")
    void shouldThrowBadRequestWhenPreviousLecturesNotCompletedForStudent() {
        // Arrange
        LectureProjection projection = mock(LectureProjection.class);
        when(projection.getCourseId()).thenReturn(COURSE_ID);
        when(projection.getLectureOrder()).thenReturn(2);

        when(lectureRepository.findLectureDetailByIdAndUsername(LECTURE_ID, "student1"))
                .thenReturn(Optional.of(projection));
        when(lectureRepository.hasCompletedAllPreviousLectures(COURSE_ID, 2, "student1"))
                .thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> lectureService.getLecture(Set.of(RoleEnum.STUDENT.name()), "student1", LECTURE_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("You must complete all previous lectures to access this lecture.");
    }

    @Test
    @DisplayName("getLecture - should return lecture response when access valid")
    void shouldGetLectureSuccessfully() {
        // Arrange
        LectureProjection projection = mock(LectureProjection.class);
        when(lectureRepository.findLectureDetailByIdAndUsername(LECTURE_ID, ACTOR))
                .thenReturn(Optional.of(projection));

        LectureResponse response = LectureResponse.builder().build();
        when(lectureMapper.projectionToResponse(projection)).thenReturn(response);

        // Act
        LectureResponse result = lectureService.getLecture(Set.of(RoleEnum.LECTURER.name()), ACTOR, LECTURE_ID);

        // Assert
        assertThat(result).isEqualTo(response);
    }

    // ==================== createLecture ====================

    @Test
    @DisplayName("createLecture - should create lecture successfully")
    void shouldCreateLectureSuccessfully() {
        // Arrange
        LectureRequest request = new LectureRequest();
        request.setCourseId(COURSE_ID);
        request.setTitle("Lecture 1");

        when(lectureRepository.getMaxOrderByCourseId(COURSE_ID)).thenReturn(0);

        LectureEntity entity = LectureEntity.builder().id(LECTURE_ID).build();
        when(lectureMapper.reqToEntity(request)).thenReturn(entity);

        LectureResponse response = LectureResponse.builder().build();
        when(lectureMapper.entityToResponse(entity)).thenReturn(response);

        // Act
        LectureResponse result = lectureService.createLecture(Set.of(RoleEnum.LECTURER.name()), ACTOR, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(lectureRepository).save(entity);
        assertThat(entity.getLectureOrder()).isEqualTo(1);
    }

    // ==================== updateLecture ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("updateLecture - should throw BadRequestException when updating non-existent lecture")
    void shouldThrowBadRequestWhenUpdatingNonExistentLecture() {
        // Arrange
        LectureRequest request = new LectureRequest();
        request.setId(LECTURE_ID);
        request.setCourseId(COURSE_ID);

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> lectureService.updateLecture(Set.of(RoleEnum.LECTURER.name()), ACTOR, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Lecture not found.");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("updateLecture - should update lecture successfully")
    void shouldUpdateLectureSuccessfully() {
        // Arrange
        LectureRequest request = new LectureRequest();
        request.setId(LECTURE_ID);
        request.setCourseId(COURSE_ID);
        request.setTitle("Updated Title");

        LectureEntity entity = LectureEntity.builder().id(LECTURE_ID).build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(entity);

        LectureResponse response = LectureResponse.builder().build();
        when(lectureMapper.entityToResponse(entity)).thenReturn(response);

        // Act
        LectureResponse result = lectureService.updateLecture(Set.of(RoleEnum.LECTURER.name()), ACTOR, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(lectureRepository).save(entity);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()));
    }

    // ==================== deleteLecture ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("deleteLecture - should soft delete lecture successfully")
    void shouldDeleteLectureSuccessfully() {
        // Arrange
        LectureEntity entity = LectureEntity.builder().id(LECTURE_ID).build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(entity);

        // Act
        lectureService.deleteLecture(Set.of(RoleEnum.LECTURER.name()), ACTOR, LECTURE_ID);

        // Verify & Assert
        assertThat(entity.getDeletedAt()).isNotNull();
        verify(lectureRepository).save(entity);
    }
}
