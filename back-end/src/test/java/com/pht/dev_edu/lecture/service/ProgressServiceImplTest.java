package com.pht.dev_edu.lecture.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import org.springframework.data.redis.core.RedisTemplate;

/*
 * <analysis>
 * ProgressServiceImpl
 * - updateProgress(String actor, ProgressSegmentRequest req)
 *   - branches:
 *       segmentStart > segmentEnd -> BadRequestException ("Invalid segment range")
 *       already completed in DB -> returns ProgressResponse(completed=true)
 *       lecture not found or deleted -> DataNotFoundException
 *       previous lectures not completed -> BadRequestException ("You must complete all previous lectures...")
 *       lecture duration == 0 -> saves progress to DB, returns ProgressResponse(completed=true)
 *       segmentEnd > duration -> BadRequestException ("Segment end exceeds lecture duration")
 *       total watched < 70% threshold -> returns ProgressResponse(completed=false)
 *       total watched >= 70% threshold -> saves progress to DB, deletes Redis key, returns ProgressResponse(completed=true)
 *   - paths:
 *       [P1: invalid segment range -> BadRequestException]
 *       [P2: already completed]
 *       [P3: lecture duration == 0 -> completed]
 *       [P4: segmentEnd > duration -> BadRequestException]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenSegmentStartGreaterThanEnd -> P1]
 *       [shouldReturnCompletedTrueWhenProgressAlreadyExists -> P2]
 *       [shouldSaveProgressDirectlyWhenLectureDurationIsZero -> P3]
 *       [shouldThrowBadRequestWhenSegmentEndExceedsDuration -> P4]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for ProgressServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify video progress tracking and threshold completion logic in ProgressServiceImpl.
 *
 * Test Scope
 * ----------
 * - updateProgress(String, ProgressSegmentRequest)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Segment boundary validation (start <= end, end <= duration)
 * ✓ Pre-existing progress return
 * ✓ Zero-duration lecture auto-completion
 *
 * Mocked Dependencies
 * -------------------
 * - LectureProgressRepository
 * - LectureRepository
 * - ObjectMapper
 * - RedisTemplate
 * - LecturePermissionService
 * - RedisUtils (static mock)
 */

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.lecture.dto.ProgressResponse;
import com.pht.dev_edu.lecture.dto.ProgressSegmentRequest;
import com.pht.dev_edu.lecture.entity.LectureEntity;
import com.pht.dev_edu.lecture.repo.LectureProgressRepository;
import com.pht.dev_edu.lecture.repo.LectureRepository;

@ExtendWith(MockitoExtension.class)
class ProgressServiceImplTest {

    @Mock
    private LectureProgressRepository lectureProgressRepository;
    @Mock
    private LectureRepository lectureRepository;
    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private RedisTemplate<String, Object> redisTemplate;
    @Mock
    private LecturePermissionService lecturePermissionService;

    @InjectMocks
    private ProgressServiceImpl progressService;

    private MockedStatic<RedisUtils> redisUtilsMock;

    private static final String STUDENT = "student1";
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

    @Test
    @DisplayName("updateProgress - should throw BadRequestException when segmentStart > segmentEnd")
    void shouldThrowBadRequestWhenSegmentStartGreaterThanEnd() {
        // Arrange
        ProgressSegmentRequest request = new ProgressSegmentRequest();
        request.setSegmentStart(100);
        request.setSegmentEnd(50); // Start > End

        // Act & Assert
        assertThatThrownBy(() -> progressService.updateProgress(STUDENT, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid segment range");
    }

    @Test
    @DisplayName("updateProgress - should return completed true when progress already exists in DB")
    void shouldReturnCompletedTrueWhenProgressAlreadyExists() {
        // Arrange
        ProgressSegmentRequest request = new ProgressSegmentRequest();
        request.setLectureId(LECTURE_ID);
        request.setSegmentStart(0);
        request.setSegmentEnd(50);

        when(lectureProgressRepository.existsByLectureIdAndStudent(LECTURE_ID, STUDENT)).thenReturn(true);

        // Act
        ProgressResponse result = progressService.updateProgress(STUDENT, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCompleted()).isTrue();
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("updateProgress - should save progress directly when lecture duration is zero")
    void shouldSaveProgressDirectlyWhenLectureDurationIsZero() {
        // Arrange
        ProgressSegmentRequest request = new ProgressSegmentRequest();
        request.setLectureId(LECTURE_ID);
        request.setSegmentStart(0);
        request.setSegmentEnd(0);

        when(lectureProgressRepository.existsByLectureIdAndStudent(LECTURE_ID, STUDENT)).thenReturn(false);

        LectureEntity lecture = LectureEntity.builder()
                .id(LECTURE_ID)
                .courseId(COURSE_ID)
                .lectureOrder(1)
                .durationInSeconds(0)
                .build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(lecture);

        when(lectureRepository.hasCompletedAllPreviousLectures(COURSE_ID, 1, STUDENT)).thenReturn(true);

        // Act
        ProgressResponse result = progressService.updateProgress(STUDENT, request);

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getCompleted()).isTrue();
        verify(lectureProgressRepository).save(any());
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("updateProgress - should throw BadRequestException when segmentEnd exceeds lecture duration")
    void shouldThrowBadRequestWhenSegmentEndExceedsDuration() {
        // Arrange
        ProgressSegmentRequest request = new ProgressSegmentRequest();
        request.setLectureId(LECTURE_ID);
        request.setSegmentStart(0);
        request.setSegmentEnd(200); // Exceeds duration 100

        when(lectureProgressRepository.existsByLectureIdAndStudent(LECTURE_ID, STUDENT)).thenReturn(false);

        LectureEntity lecture = LectureEntity.builder()
                .id(LECTURE_ID)
                .courseId(COURSE_ID)
                .lectureOrder(1)
                .durationInSeconds(100)
                .build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(LectureEntity.class), any(Supplier.class), any())).thenReturn(lecture);

        when(lectureRepository.hasCompletedAllPreviousLectures(COURSE_ID, 1, STUDENT)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> progressService.updateProgress(STUDENT, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Segment end exceeds lecture duration");
    }
}
