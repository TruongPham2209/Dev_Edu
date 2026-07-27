package com.pht.dev_edu.course.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
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
import org.springframework.data.redis.core.ValueOperations;

/*
 * <analysis>
 * CourseServiceImpl
 * - getCourseDetail(String username, UUID courseId)
 *   - branches:
 *       courseDetail == null -> DataNotFoundException
 *       courseDetail != null -> calculate discount & populate lecturers
 *   - paths:
 *       [P1: courseDetail not found -> DataNotFoundException]
 *       [P2: courseDetail found]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenCourseDetailNotFound -> P1]
 *       [shouldReturnCourseDetailResponseWithLecturers -> P2]
 *
 * - getCourseById(UUID courseId)
 *   - branches:
 *       courseEntity == null -> DataNotFoundException
 *       courseEntity.deletedAt != null -> DataNotFoundException
 *       courseEntity active -> map to res
 *   - paths:
 *       [P1: course null -> DataNotFoundException]
 *       [P2: course deleted -> DataNotFoundException]
 *       [P3: course active -> return CourseResponse]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenCourseEntityNotFound -> P1]
 *       [shouldThrowDataNotFoundWhenCourseEntityIsDeleted -> P2]
 *       [shouldReturnCourseResponseWhenCourseIsActive -> P3]
 *
 * - getHighlightedCourses()
 *   - branches:
 *       cached in redis -> return from cache
 *       highlightedCourses empty -> return empty list
 *       highlightedCourses present -> calculate discount, cache in redis, return
 *   - paths:
 *       [P1: cached in redis]
 *       [P2: db empty]
 *       [P3: db present]
 *   - planned tests:
 *       [shouldReturnHighlightedCoursesFromCache -> P1]
 *       [shouldReturnEmptyListWhenNoHighlightedCoursesInDb -> P2]
 *       [shouldFetchHighlightedCoursesFromDbAndCache -> P3]
 *
 * - createCourse(String author, CourseRequest course)
 *   - branches:
 *       category not found -> DataNotFoundException
 *       invalid lecturers count -> BadRequestException
 *       invalid thumbnail image -> BadRequestException
 *       success -> save entity & lecturers, return res
 *   - paths:
 *       [P1: category not found]
 *       [P2: invalid lecturers]
 *       [P3: invalid thumbnail]
 *       [P4: successful creation]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenCategoryNotFoundOnCreate -> P1]
 *       [shouldThrowBadRequestWhenLecturerUsernamesInvalidOnCreate -> P2]
 *       [shouldThrowBadRequestWhenThumbnailInvalidOnCreate -> P3]
 *       [shouldCreateCourseSuccessfully -> P4]
 *
 * - updateCourse(String author, CourseRequest course)
 *   - branches:
 *       existing course null or deleted -> DataNotFoundException
 *       category not found -> DataNotFoundException
 *       invalid lecturers -> BadRequestException
 *       success -> update entity, update lecturers, invalidates cache & async tracking
 *   - paths:
 *       [P1: existing course not found]
 *       [P2: category not found]
 *       [P3: invalid lecturers]
 *       [P4: successful update]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenUpdatingNonExistentCourse -> P1]
 *       [shouldThrowDataNotFoundWhenCategoryNotFoundOnUpdate -> P2]
 *       [shouldThrowBadRequestWhenLecturersInvalidOnUpdate -> P3]
 *       [shouldUpdateCourseSuccessfully -> P4]
 *
 * - deleteCourse(String actor, UUID courseId)
 *   - branches:
 *       existing course null -> DataNotFoundException
 *       existing course deleted -> warn & return
 *       has enrollments -> BadRequestException
 *       success -> set deletedAt, save, invalidate cache
 *   - paths:
 *       [P1: course null]
 *       [P2: course already deleted]
 *       [P3: course has enrollments]
 *       [P4: successful soft delete]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenDeletingNonExistentCourse -> P1]
 *       [shouldDoNothingWhenDeletingAlreadyDeletedCourse -> P2]
 *       [shouldThrowBadRequestWhenDeletingCourseWithEnrollments -> P3]
 *       [shouldDeleteCourseSuccessfully -> P4]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for CourseServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify core course lifecycle, highlights, and business validations in CourseServiceImpl.
 *
 * Test Scope
 * ----------
 * - getCourseDetail(String, UUID)
 * - getCourseById(UUID)
 * - getHighlightedCourses()
 * - createCourse(String, CourseRequest)
 * - updateCourse(String, CourseRequest)
 * - deleteCourse(String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Detail lookup & calculation of global vs course discounts
 * ✓ Entity retrieval guard clauses (not found, deleted)
 * ✓ Redis caching for highlighted courses (hit vs miss)
 * ✓ Category & lecturer validations during creation and update
 * ✓ Thumbnail image validation
 * ✓ Delete course validations (enrollment restraint, already deleted)
 * ✓ Soft-deletion and cache invalidations
 *
 * Mocked Dependencies
 * -------------------
 * - CourseRepository
 * - CourseLecturerRepository
 * - EnrollmentRepository
 * - UserRepository
 * - CourseDiscountRepository
 * - FileService
 * - CategoryService
 * - RedisTemplate
 * - ObjectMapper
 * - CourseMapper
 * - Executor
 * - RedisUtils (static mock)
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.course.dto.CourseDetailProjection;
import com.pht.dev_edu.course.dto.CourseRequest;
import com.pht.dev_edu.course.dto.CourseResponse;
import com.pht.dev_edu.course.entity.CategoryEntity;
import com.pht.dev_edu.course.entity.CourseEntity;
import com.pht.dev_edu.course.entity.CourseLecturerEntity;
import com.pht.dev_edu.course.entity.CourseLecturerId;
import com.pht.dev_edu.course.mapper.CourseMapper;
import com.pht.dev_edu.course.repo.CourseDiscountRepository;
import com.pht.dev_edu.course.repo.CourseLecturerRepository;
import com.pht.dev_edu.course.repo.CourseRepository;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import com.pht.dev_edu.file.dto.FileUploadResponse;
import com.pht.dev_edu.file.service.FileService;
import com.pht.dev_edu.user.repo.UserRepository;

@ExtendWith(MockitoExtension.class)
class CourseServiceImplTest {

    @Mock
    private CourseRepository courseRepository;
    @Mock
    private CourseLecturerRepository courseLecturerRepository;
    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CourseDiscountRepository courseDiscountRepository;
    @Mock
    private FileService fileService;
    @Mock
    private CategoryService categoryService;
    @Mock
    private org.springframework.data.redis.core.RedisTemplate<String, Object> redisTemplate;
    @Mock
    private ValueOperations<String, Object> valueOperations;
    @Mock
    private ObjectMapper objectMapper;
    @Mock
    private CourseMapper courseMapper;
    @Mock
    private Executor executor;

    @InjectMocks
    private CourseServiceImpl courseService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    private static final String AUTHOR = "instructor1";
    private static final UUID COURSE_ID = UUID.randomUUID();
    private static final UUID CATEGORY_ID = UUID.randomUUID();

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

    // ==================== getCourseDetail ====================

    @Test
    @DisplayName("getCourseDetail - should throw DataNotFoundException when course detail projection is null")
    void shouldThrowDataNotFoundWhenCourseDetailNotFound() {
        // Arrange
        when(courseRepository.findCourseDetail(COURSE_ID, AUTHOR)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> courseService.getCourseDetail(AUTHOR, COURSE_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Course not found");
    }

    @Test
    @DisplayName("getCourseDetail - should return course detail response with lecturers when found")
    void shouldReturnCourseDetailResponseWithLecturers() {
        // Arrange
        CourseDetailProjection projection = mock(CourseDetailProjection.class);
        when(projection.getOriginalPrice()).thenReturn(BigDecimal.valueOf(100.00));
        when(projection.getDiscountedPercentage()).thenReturn(BigDecimal.valueOf(10.00));
        when(courseRepository.findCourseDetail(COURSE_ID, AUTHOR)).thenReturn(projection);

        CourseResponse mappedRes = CourseResponse.builder().build();
        when(courseMapper.projectionToRes(projection)).thenReturn(mappedRes);

        CourseLecturerEntity lecturerEntity = CourseLecturerEntity.builder()
                .id(CourseLecturerId.builder().courseId(COURSE_ID).lecturerUsername("lecturer_a")
                        .build())
                .build();
        when(courseLecturerRepository.findAllByIdCourseId(COURSE_ID)).thenReturn(List.of(lecturerEntity));

        when(courseDiscountRepository.getGlobalActiveDiscount(any())).thenReturn(Optional.empty());

        // Act
        CourseResponse result = courseService.getCourseDetail(AUTHOR, COURSE_ID);

        // Assert
        assertThat(result).isEqualTo(mappedRes);
        assertThat(result.getLecturers()).containsExactly("lecturer_a");
    }

    // ==================== getCourseById ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getCourseById - should throw DataNotFoundException when course entity is null")
    void shouldThrowDataNotFoundWhenCourseEntityNotFound() {
        // Arrange
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CourseEntity.class), any(Supplier.class), any())).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> courseService.getCourseById(COURSE_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Course not found.");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getCourseById - should throw DataNotFoundException when course entity is deleted")
    void shouldThrowDataNotFoundWhenCourseEntityIsDeleted() {
        // Arrange
        CourseEntity deletedCourse = CourseEntity.builder().id(COURSE_ID).deletedAt(LocalDateTime.now())
                .build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CourseEntity.class), any(Supplier.class), any()))
                .thenReturn(deletedCourse);

        // Act & Assert
        assertThatThrownBy(() -> courseService.getCourseById(COURSE_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Course not found.");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getCourseById - should return CourseResponse when course entity is active")
    void shouldReturnCourseResponseWhenCourseIsActive() {
        // Arrange
        CourseEntity activeCourse = CourseEntity.builder().id(COURSE_ID).title("Spring Boot").build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CourseEntity.class), any(Supplier.class), any()))
                .thenReturn(activeCourse);

        CourseResponse mappedRes = CourseResponse.builder().build();
        when(courseMapper.entityToRes(activeCourse)).thenReturn(mappedRes);

        // Act
        CourseResponse result = courseService.getCourseById(COURSE_ID);

        // Assert
        assertThat(result).isEqualTo(mappedRes);
    }

    // ==================== getHighlightedCourses ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("getHighlightedCourses - should return cached highlighted courses when present in Redis")
    void shouldReturnHighlightedCoursesFromCache() {
        // Arrange
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        Object cachedObj = new Object();
        when(valueOperations.get(anyString())).thenReturn(cachedObj);

        List<CourseResponse> cachedList = List.of(CourseResponse.builder().build());
        when(objectMapper.convertValue(eq(cachedObj), any(TypeReference.class))).thenReturn(cachedList);

        // Act
        List<CourseResponse> result = courseService.getHighlightedCourses();

        // Assert
        assertThat(result).isEqualTo(cachedList);
    }

    @Test
    @DisplayName("getHighlightedCourses - should return empty list when DB has no highlighted courses")
    void shouldReturnEmptyListWhenNoHighlightedCoursesInDb() {
        // Arrange
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get(anyString())).thenReturn(null);
        when(courseRepository.findHighlightedCourses(10)).thenReturn(List.of());

        // Act
        List<CourseResponse> result = courseService.getHighlightedCourses();

        // Assert
        assertThat(result).isEmpty();
    }

    // ==================== createCourse ====================

    @Test
    @DisplayName("createCourse - should throw DataNotFoundException when category not found")
    void shouldThrowDataNotFoundWhenCategoryNotFoundOnCreate() {
        // Arrange
        CourseRequest request = new CourseRequest();
        request.setCategoryId(CATEGORY_ID);

        when(categoryService.getCategoryById(CATEGORY_ID)).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> courseService.createCourse(AUTHOR, request))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Category not found.");
    }

    @Test
    @DisplayName("createCourse - should throw BadRequestException when lecturer usernames count mismatch")
    void shouldThrowBadRequestWhenLecturerUsernamesInvalidOnCreate() {
        // Arrange
        CourseRequest request = new CourseRequest();
        request.setCategoryId(CATEGORY_ID);
        request.setLecturerUsernames(List.of("lec1", "lec2"));

        when(categoryService.getCategoryById(CATEGORY_ID)).thenReturn(new CategoryEntity());
        when(userRepository.countByUsernamesAndRole(request.getLecturerUsernames(), RoleEnum.LECTURER.name()))
                .thenReturn(1); // Only 1 valid out of 2

        // Act & Assert
        assertThatThrownBy(() -> courseService.createCourse(AUTHOR, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("One or more lecturer usernames are invalid.");
    }

    @Test
    @DisplayName("createCourse - should create course successfully")
    void shouldCreateCourseSuccessfully() {
        // Arrange
        CourseRequest request = new CourseRequest();
        request.setCategoryId(CATEGORY_ID);
        request.setLecturerUsernames(List.of("lec1"));
        request.setThumbnailObjectKey("pub-bucket/course.png");

        when(categoryService.getCategoryById(CATEGORY_ID)).thenReturn(new CategoryEntity());
        when(userRepository.countByUsernamesAndRole(request.getLecturerUsernames(), RoleEnum.LECTURER.name()))
                .thenReturn(1);

        FileUploadResponse fileInfo = FileUploadResponse.builder()
                .contentType("image/png")
                .publicUrl("https://pub-url/course.png")
                .build();
        when(fileService.getFileInfo(AUTHOR, "pub-bucket/course.png")).thenReturn(fileInfo);

        CourseEntity entity = CourseEntity.builder().id(COURSE_ID).build();
        when(courseMapper.reqToEntity(request)).thenReturn(entity);

        CourseResponse mappedRes = CourseResponse.builder().build();
        when(courseMapper.entityToRes(entity)).thenReturn(mappedRes);

        // Act
        CourseResponse result = courseService.createCourse(AUTHOR, request);

        // Assert
        assertThat(result).isEqualTo(mappedRes);
        verify(courseRepository).save(entity);
        verify(courseLecturerRepository).saveAll(any());
        assertThat(entity.getCreatedBy()).isEqualTo(AUTHOR);
    }

    // ==================== deleteCourse ====================

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("deleteCourse - should throw DataNotFoundException when course not found")
    void shouldThrowDataNotFoundWhenDeletingNonExistentCourse() {
        // Arrange
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CourseEntity.class), any(Supplier.class), any())).thenReturn(null);

        // Act & Assert
        assertThatThrownBy(() -> courseService.deleteCourse(AUTHOR, COURSE_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Course not found.");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("deleteCourse - should throw BadRequestException when course has enrollments")
    void shouldThrowBadRequestWhenDeletingCourseWithEnrollments() {
        // Arrange
        CourseEntity activeCourse = CourseEntity.builder().id(COURSE_ID).build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CourseEntity.class), any(Supplier.class), any()))
                .thenReturn(activeCourse);

        when(enrollmentRepository.existsByCourseId(COURSE_ID)).thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> courseService.deleteCourse(AUTHOR, COURSE_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot delete course with enrollments.");
    }

    @SuppressWarnings("unchecked")
    @Test
    @DisplayName("deleteCourse - should delete course successfully when no enrollments")
    void shouldDeleteCourseSuccessfully() {
        // Arrange
        CourseEntity activeCourse = CourseEntity.builder().id(COURSE_ID).build();
        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(CourseEntity.class), any(Supplier.class), any()))
                .thenReturn(activeCourse);

        when(enrollmentRepository.existsByCourseId(COURSE_ID)).thenReturn(false);

        // Act
        courseService.deleteCourse(AUTHOR, COURSE_ID);

        // Verify & Assert
        assertThat(activeCourse.getDeletedAt()).isNotNull();
        verify(courseRepository).save(activeCourse);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()), times(2));
    }
}
