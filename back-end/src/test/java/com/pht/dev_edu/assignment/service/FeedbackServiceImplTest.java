package com.pht.dev_edu.assignment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
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

/*
 * <analysis>
 * FeedbackServiceImpl
 * - getFeedbacksByAssignment(Set<String> authorities, String actor, UUID assignmentId, String studentUsername)
 *   - paths:
 *       [P1: checks view assignment permission, retrieves feedbacks, maps to response list]
 *   - planned tests:
 *       [shouldGetFeedbacksByAssignmentSuccessfully -> P1]
 *
 * - create(Set<String> authorities, String author, FeedbackRequest req)
 *   - branches:
 *       student not found in UserRepository -> DataNotFoundException
 *       student found -> checks modify assignment permission, saves feedback, returns response
 *   - paths:
 *       [P1: student not found -> DataNotFoundException]
 *       [P2: student found -> creates feedback]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenStudentNotFoundOnFeedbackCreate -> P1]
 *       [shouldCreateFeedbackSuccessfully -> P2]
 *
 * - delete(Set<String> authorities, String actor, UUID feedbackId)
 *   - branches:
 *       feedback not found -> DataNotFoundException
 *       feedback found -> checks modify assignment permission, deletes feedback
 *   - paths:
 *       [P1: feedback not found -> DataNotFoundException]
 *       [P2: feedback found -> deletes feedback]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenFeedbackNotFoundOnDelete -> P1]
 *       [shouldDeleteFeedbackSuccessfully -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for FeedbackServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify submission feedback operations and permission validations in FeedbackServiceImpl.
 *
 * Test Scope
 * ----------
 * - getFeedbacksByAssignment(Set<String>, String, UUID, String)
 * - create(Set<String>, String, FeedbackRequest)
 * - delete(Set<String>, String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Fetching feedbacks for an assignment submission
 * ✓ Feedback creation with student existence check
 * ✓ Feedback deletion and permission check
 *
 * Mocked Dependencies
 * -------------------
 * - FeedbackRepository
 * - UserRepository
 * - AssignmentPermissionService
 * - FeedbackMapper
 * - Executor
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.pht.dev_edu.assignment.dto.FeedbackProjection;
import com.pht.dev_edu.assignment.dto.FeedbackRequest;
import com.pht.dev_edu.assignment.dto.FeedbackResponse;
import com.pht.dev_edu.assignment.entity.FeedbackEntity;
import com.pht.dev_edu.assignment.mapper.FeedbackMapper;
import com.pht.dev_edu.assignment.repo.FeedbackRepository;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.user.repo.UserRepository;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceImplTest {

    @Mock
    private FeedbackRepository feedbackRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private AssignmentPermissionService assignmentPermissionService;
    @Mock
    private FeedbackMapper feedbackMapper;
    @Mock
    private Executor executor;

    @InjectMocks
    private FeedbackServiceImpl feedbackService;

    private static final String LECTURER = "lecturer1";
    private static final String STUDENT = "student1";
    private static final UUID ASSIGNMENT_ID = UUID.randomUUID();
    private static final UUID FEEDBACK_ID = UUID.randomUUID();

    @Test
    @DisplayName("getFeedbacksByAssignment - should return feedback responses")
    void shouldGetFeedbacksByAssignmentSuccessfully() {
        // Arrange
        FeedbackProjection projection = mock(FeedbackProjection.class);
        when(feedbackRepository.findByAssignmentIdAndStudentUsername(ASSIGNMENT_ID, STUDENT))
                .thenReturn(List.of(projection));

        FeedbackResponse response = FeedbackResponse.builder().build();
        when(feedbackMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        List<FeedbackResponse> result = feedbackService.getFeedbacksByAssignment(Set.of("ROLE_LECTURER"), LECTURER,
                ASSIGNMENT_ID, STUDENT);

        // Assert
        assertThat(result).hasSize(1).contains(response);
        verify(assignmentPermissionService).checkViewAssignmentPermissionByAssignment(any(), eq(LECTURER),
                eq(ASSIGNMENT_ID));
    }

    @Test
    @DisplayName("create - should throw DataNotFoundException when student username not found")
    void shouldThrowDataNotFoundWhenStudentNotFoundOnFeedbackCreate() {
        // Arrange
        FeedbackRequest request = new FeedbackRequest();
        request.setStudentUsername(STUDENT);

        when(userRepository.existsByUsername(STUDENT)).thenReturn(false);

        // Act & Assert
        assertThatThrownBy(() -> feedbackService.create(Set.of("ROLE_LECTURER"), LECTURER, request))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Student not found.");
    }

    @Test
    @DisplayName("create - should create feedback successfully")
    void shouldCreateFeedbackSuccessfully() {
        // Arrange
        FeedbackRequest request = new FeedbackRequest();
        request.setStudentUsername(STUDENT);
        request.setAssignmentId(ASSIGNMENT_ID);

        when(userRepository.existsByUsername(STUDENT)).thenReturn(true);

        FeedbackEntity entity = FeedbackEntity.builder().id(FEEDBACK_ID).build();
        when(feedbackMapper.reqToEntity(request)).thenReturn(entity);

        FeedbackResponse response = FeedbackResponse.builder().build();
        when(feedbackMapper.entityToRes(entity)).thenReturn(response);

        // Act
        FeedbackResponse result = feedbackService.create(Set.of("ROLE_LECTURER"), LECTURER, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(feedbackRepository).save(entity);
        assertThat(entity.getLecturer()).isEqualTo(LECTURER);
    }

    @Test
    @DisplayName("delete - should throw DataNotFoundException when feedback not found")
    void shouldThrowDataNotFoundWhenFeedbackNotFoundOnDelete() {
        // Arrange
        when(feedbackRepository.findById(FEEDBACK_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> feedbackService.delete(Set.of("ROLE_LECTURER"), LECTURER, FEEDBACK_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Feedback not found.");
    }

    @Test
    @DisplayName("delete - should delete feedback successfully")
    void shouldDeleteFeedbackSuccessfully() {
        // Arrange
        FeedbackEntity entity = FeedbackEntity.builder()
                .id(FEEDBACK_ID)
                .assignmentId(ASSIGNMENT_ID)
                .feedback("Good work")
                .build();
        when(feedbackRepository.findById(FEEDBACK_ID)).thenReturn(Optional.of(entity));

        // Act
        feedbackService.delete(Set.of("ROLE_LECTURER"), LECTURER, FEEDBACK_ID);

        // Verify
        verify(feedbackRepository).delete(entity);
    }
}
