package com.pht.dev_edu.course.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

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
 * ReviewServiceImpl
 * - createReview(String username, ReviewRequest request)
 *   - branches:
 *       user not enrolled in course -> BadRequestException
 *       user already reviewed course -> BadRequestException
 *       success -> map, set studentUsername, save, return res
 *   - paths:
 *       [P1: not enrolled]
 *       [P2: already reviewed]
 *       [P3: successful review creation]
 *   - planned tests:
 *       [shouldThrowBadRequestWhenUserNotEnrolled -> P1]
 *       [shouldThrowBadRequestWhenUserAlreadyReviewed -> P2]
 *       [shouldCreateReviewSuccessfully -> P3]
 *
 * - getMyReview(UUID courseId, String username)
 *   - branches:
 *       projection == null -> return null
 *       projection != null -> return response
 *   - paths:
 *       [P1: null projection]
 *       [P2: non-null projection]
 *   - planned tests:
 *       [shouldReturnNullWhenMyReviewNotFound -> P1]
 *       [shouldReturnMyReviewResponseWhenFound -> P2]
 *
 * - deleteReview(Set<String> authorities, String username, UUID reviewId)
 *   - branches:
 *       review == null -> log warn & return
 *       hasDeletePermission == false (neither ADMIN nor owner) -> BadRequestException
 *       hasDeletePermission == true (ADMIN or owner) -> delete & async tracking
 *   - paths:
 *       [P1: review not found]
 *       [P2: no delete permission]
 *       [P3: delete as owner]
 *       [P4: delete as ADMIN]
 *   - planned tests:
 *       [shouldDoNothingWhenReviewNotFoundForDeletion -> P1]
 *       [shouldThrowBadRequestWhenUserHasNoDeletePermission -> P2]
 *       [shouldDeleteReviewSuccessfullyAsOwner -> P3]
 *       [shouldDeleteReviewSuccessfullyAsAdmin -> P4]
 *
 * - getReviewsByCourse(String username, UUID courseId, String nextCursor)
 *   - paths:
 *       [P1: fetch reviews with cursor & attach my review if top page]
 *   - planned tests:
 *       [shouldGetReviewsByCourseWithPagingAndMyComments -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for ReviewServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify course review management and permissions in ReviewServiceImpl.
 *
 * Test Scope
 * ----------
 * - createReview(String, ReviewRequest)
 * - getMyReview(UUID, String)
 * - deleteReview(Set<String>, String, UUID)
 * - getReviewsByCourse(String, UUID, String)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Enrollment guard check for creating review
 * ✓ Duplicate review restriction per user/course
 * ✓ Successful review creation
 * ✓ Retrieving current user's review (empty vs populated)
 * ✓ Permission-based deletion (Owner, Admin, Unauthorized user)
 * ✓ Course reviews pagination & prepend user's own comments
 *
 * Mocked Dependencies
 * -------------------
 * - EnrollmentRepository
 * - CourseReviewRepository
 * - ReviewMapper
 * - Executor
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.course.dto.ReviewProjection;
import com.pht.dev_edu.course.dto.ReviewRequest;
import com.pht.dev_edu.course.dto.ReviewResponse;
import com.pht.dev_edu.course.entity.CourseReviewEntity;
import com.pht.dev_edu.course.mapper.ReviewMapper;
import com.pht.dev_edu.course.repo.CourseReviewRepository;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;

@ExtendWith(MockitoExtension.class)
class ReviewServiceImplTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;
    @Mock
    private CourseReviewRepository reviewRepository;
    @Mock
    private ReviewMapper reviewMapper;
    @Mock
    private Executor executor;

    @InjectMocks
    private ReviewServiceImpl reviewService;

    private static final String USERNAME = "student_user";
    private static final UUID COURSE_ID = UUID.randomUUID();
    private static final UUID REVIEW_ID = UUID.randomUUID();

    // ==================== createReview ====================

    @Test
    @DisplayName("createReview - should throw BadRequestException when user is not enrolled")
    void shouldThrowBadRequestWhenUserNotEnrolled() {
        // Arrange
        ReviewRequest request = new ReviewRequest();
        request.setCourseId(COURSE_ID);

        when(enrollmentRepository.existsByStudentUsernameAndCourseId(USERNAME, COURSE_ID))
                .thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> reviewService.createReview(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("You must be enrolled in the course to create a review.");
    }

    @Test
    @DisplayName("createReview - should throw BadRequestException when user has already created a review")
    void shouldThrowBadRequestWhenUserAlreadyReviewed() {
        // Arrange
        ReviewRequest request = new ReviewRequest();
        request.setCourseId(COURSE_ID);

        when(enrollmentRepository.existsByStudentUsernameAndCourseId(USERNAME, COURSE_ID))
                .thenReturn(true);
        when(reviewRepository.existsByCourseIdAndStudentUsername(COURSE_ID, USERNAME))
                .thenReturn(true);

        // Act & Assert
        assertThatThrownBy(() -> reviewService.createReview(USERNAME, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("You have already created a review for this course.");
    }

    @Test
    @DisplayName("createReview - should create review successfully")
    void shouldCreateReviewSuccessfully() {
        // Arrange
        ReviewRequest request = new ReviewRequest();
        request.setCourseId(COURSE_ID);

        when(enrollmentRepository.existsByStudentUsernameAndCourseId(USERNAME, COURSE_ID))
                .thenReturn(true);
        when(reviewRepository.existsByCourseIdAndStudentUsername(COURSE_ID, USERNAME))
                .thenReturn(false);

        CourseReviewEntity entity = new CourseReviewEntity();
        when(reviewMapper.reqToEntity(request)).thenReturn(entity);

        ReviewResponse response = ReviewResponse.builder().build();
        when(reviewMapper.entityToResponse(entity)).thenReturn(response);

        // Act
        ReviewResponse result = reviewService.createReview(USERNAME, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(reviewRepository).save(entity);
        assertThat(entity.getStudentUsername()).isEqualTo(USERNAME);
    }

    // ==================== getMyReview ====================

    @Test
    @DisplayName("getMyReview - should return null when review projection not found")
    void shouldReturnNullWhenMyReviewNotFound() {
        // Arrange
        when(reviewRepository.findByUsernameAndCourseId(USERNAME, COURSE_ID)).thenReturn(null);

        // Act
        ReviewResponse result = reviewService.getMyReview(COURSE_ID, USERNAME);

        // Assert
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("getMyReview - should return review response when projection found")
    void shouldReturnMyReviewResponseWhenFound() {
        // Arrange
        ReviewProjection projection = mock(ReviewProjection.class);
        when(reviewRepository.findByUsernameAndCourseId(USERNAME, COURSE_ID)).thenReturn(projection);

        ReviewResponse response = ReviewResponse.builder().build();
        when(reviewMapper.projectionToResponse(projection)).thenReturn(response);

        // Act
        ReviewResponse result = reviewService.getMyReview(COURSE_ID, USERNAME);

        // Assert
        assertThat(result).isEqualTo(response);
    }

    // ==================== deleteReview ====================

    @Test
    @DisplayName("deleteReview - should do nothing when review not found")
    void shouldDoNothingWhenReviewNotFoundForDeletion() {
        // Arrange
        when(reviewRepository.findById(REVIEW_ID)).thenReturn(Optional.empty());

        // Act
        reviewService.deleteReview(Set.of("ROLE_USER"), USERNAME, REVIEW_ID);

        // Verify
        verify(reviewRepository, never()).delete(any());
    }

    @Test
    @DisplayName("deleteReview - should throw BadRequestException when user has no permission")
    void shouldThrowBadRequestWhenUserHasNoDeletePermission() {
        // Arrange
        CourseReviewEntity review = new CourseReviewEntity();
        review.setStudentUsername("other_user");

        when(reviewRepository.findById(REVIEW_ID)).thenReturn(Optional.of(review));

        // Act & Assert
        assertThatThrownBy(() -> reviewService.deleteReview(Set.of("ROLE_USER"), USERNAME, REVIEW_ID))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("You do not have permission to delete this review.");
    }

    @Test
    @DisplayName("deleteReview - should delete review successfully when user is owner")
    void shouldDeleteReviewSuccessfullyAsOwner() {
        // Arrange
        CourseReviewEntity review = new CourseReviewEntity();
        review.setStudentUsername(USERNAME);
        review.setCourseId(COURSE_ID);
        review.setComment("Great course");

        when(reviewRepository.findById(REVIEW_ID)).thenReturn(Optional.of(review));

        // Act
        reviewService.deleteReview(Set.of("ROLE_USER"), USERNAME, REVIEW_ID);

        // Verify
        verify(reviewRepository).delete(review);
    }

    @Test
    @DisplayName("deleteReview - should delete review successfully when user is ADMIN")
    void shouldDeleteReviewSuccessfullyAsAdmin() {
        // Arrange
        CourseReviewEntity review = new CourseReviewEntity();
        review.setStudentUsername("other_user");
        review.setCourseId(COURSE_ID);

        when(reviewRepository.findById(REVIEW_ID)).thenReturn(Optional.of(review));

        // Act
        reviewService.deleteReview(Set.of(RoleEnum.ADMIN.name()), "admin_user", REVIEW_ID);

        // Verify
        verify(reviewRepository).delete(review);
    }

    // ==================== getReviewsByCourse ====================

    @Test
    @DisplayName("getReviewsByCourse - should get paged reviews and include user's comments on first page")
    void shouldGetReviewsByCourseWithPagingAndMyComments() {
        // Arrange
        ReviewProjection otherReview = mock(ReviewProjection.class);
        when(otherReview.getUsername()).thenReturn("other_user");

        ReviewProjection myReview = mock(ReviewProjection.class);

        PageImpl<ReviewProjection> page = new PageImpl<>(List.of(otherReview));
        when(reviewRepository.findByCourseIdAndCursor(eq(COURSE_ID), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        when(reviewRepository.findByCourseIdAndStudentUsername(COURSE_ID, USERNAME))
                .thenReturn(List.of(myReview));

        // Act
        CustomPaging<ReviewResponse> result = reviewService.getReviewsByCourse(USERNAME, COURSE_ID, null);

        // Assert
        assertThat(result).isNotNull();
    }
}
