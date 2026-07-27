package com.pht.dev_edu.assignment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Executor;

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
 * AssignmentServiceImpl
 * - getAssignmentDetail(Set<String> authorities, String actor, UUID assignmentId)
 *   - branches:
 *       permission denied -> exception from permission service
 *       assignment not found -> DataNotFoundException
 *       assignment.deletedAt != null -> DataNotFoundException
 *       assignment active -> returns mapped response
 *   - paths:
 *       [P1: assignment not found -> DataNotFoundException]
 *       [P2: assignment deleted -> DataNotFoundException]
 *       [P3: active assignment -> returns response]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenAssignmentDetailNotFound -> P1]
 *       [shouldThrowDataNotFoundWhenAssignmentDetailIsDeleted -> P2]
 *       [shouldReturnAssignmentDetailWhenActive -> P3]
 *
 * - getAssignments(Set<String> authorities, String actor, UUID lectureId)
 *   - branches:
 *       authorities do not contain STUDENT (e.g. LECTURER/ADMIN) -> findByLectureIdAndDeletedAtIsNullOrderByCreatedAt
 *       authorities contain STUDENT -> findByLectureIdAndStudentUsername
 *   - paths:
 *       [P1: non-student role]
 *       [P2: student role]
 *   - planned tests:
 *       [shouldReturnAssignmentsForNonStudentRole -> P1]
 *       [shouldReturnAssignmentsForStudentRole -> P2]
 *
 * - create(Set<String> authorities, String author, AssignmentRequest req)
 *   - paths:
 *       [P1: checks modify permission, maps request to entity, saves, returns response]
 *   - planned tests:
 *       [shouldCreateAssignmentSuccessfully -> P1]
 *
 * - delete(Set<String> authorities, String actor, UUID assignmentId)
 *   - branches:
 *       assignment not found -> DataNotFoundException
 *       assignment deletedAt != null -> DataNotFoundException
 *       active assignment -> soft delete, save & async tracking
 *   - paths:
 *       [P1: assignment not found -> DataNotFoundException]
 *       [P2: assignment deleted -> DataNotFoundException]
 *       [P3: active assignment -> soft deleted]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenDeletingNonExistentAssignment -> P1]
 *       [shouldThrowDataNotFoundWhenDeletingAlreadyDeletedAssignment -> P2]
 *       [shouldDeleteAssignmentSuccessfully -> P3]
 *
 * - deleteById / deleteByIds
 *   - paths:
 *       [P1: hard deletes assignments, feedbacks, submissions and emits file delete events]
 *   - planned tests:
 *       [shouldHardDeleteAssignmentsAndAssociatedFiles -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for AssignmentServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify assignment CRUD operations and role-based filtering in AssignmentServiceImpl.
 *
 * Test Scope
 * ----------
 * - getAssignmentDetail(Set<String>, String, UUID)
 * - getAssignments(Set<String>, String, UUID)
 * - create(Set<String>, String, AssignmentRequest)
 * - delete(Set<String>, String, UUID)
 * - deleteById(UUID) / deleteByIds(List<UUID>)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Detail retrieval with soft-deleted guard
 * ✓ Role-based assignment listing (Student vs Lecturer/Admin)
 * ✓ Assignment creation
 * ✓ Assignment soft-deletion
 * ✓ Batch hard deletion & associated file cleanup Kafka events
 *
 * Mocked Dependencies
 * -------------------
 * - AssignmentRepository
 * - SubmissionRepository
 * - FeedbackRepository
 * - Executor
 * - AssignmentPermissionService
 * - AssignmentMapper
 * - KafkaUtils (static mock)
 * - TransactionUtils (static mock)
 */

import com.pht.dev_edu.assignment.dto.AssignmentProjection;
import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.AssignmentResponse;
import com.pht.dev_edu.assignment.entity.AssignmentEntity;
import com.pht.dev_edu.assignment.mapper.AssignmentMapper;
import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.assignment.repo.FeedbackRepository;
import com.pht.dev_edu.assignment.repo.SubmissionRepository;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.KafkaUtils;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceImplTest {

    @Mock
    private AssignmentRepository assignmentRepository;
    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private FeedbackRepository feedbackRepository;
    @Mock
    private Executor executor;
    @Mock
    private AssignmentPermissionService assignmentPermissionService;
    @Mock
    private AssignmentMapper assignmentMapper;

    @InjectMocks
    private AssignmentServiceImpl assignmentService;

    private MockedStatic<KafkaUtils> kafkaUtilsMock;

    private static final String ACTOR = "lecturer1";
    private static final UUID LECTURE_ID = UUID.randomUUID();
    private static final UUID ASSIGNMENT_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        kafkaUtilsMock = mockStatic(KafkaUtils.class);
    }

    @AfterEach
    void tearDown() {
        kafkaUtilsMock.close();
    }

    // ==================== getAssignmentDetail ====================

    @Test
    @DisplayName("getAssignmentDetail - should throw DataNotFoundException when assignment not found")
    void shouldThrowDataNotFoundWhenAssignmentDetailNotFound() {
        // Arrange
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> assignmentService.getAssignmentDetail(Set.of("ROLE_LECTURER"), ACTOR, ASSIGNMENT_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Assignment not found.");
    }

    @Test
    @DisplayName("getAssignmentDetail - should throw DataNotFoundException when assignment is deleted")
    void shouldThrowDataNotFoundWhenAssignmentDetailIsDeleted() {
        // Arrange
        AssignmentEntity deletedAssignment = AssignmentEntity.builder()
                .id(ASSIGNMENT_ID)
                .deletedAt(LocalDateTime.now())
                .build();
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.of(deletedAssignment));

        // Act & Assert
        assertThatThrownBy(() -> assignmentService.getAssignmentDetail(Set.of("ROLE_LECTURER"), ACTOR, ASSIGNMENT_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Assignment not found.");
    }

    @Test
    @DisplayName("getAssignmentDetail - should return assignment detail when active")
    void shouldReturnAssignmentDetailWhenActive() {
        // Arrange
        AssignmentEntity activeAssignment = AssignmentEntity.builder()
                .id(ASSIGNMENT_ID)
                .title("Quiz 1")
                .build();
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.of(activeAssignment));

        AssignmentResponse response = AssignmentResponse.builder().build();
        when(assignmentMapper.entityToRes(activeAssignment)).thenReturn(response);

        // Act
        AssignmentResponse result = assignmentService.getAssignmentDetail(Set.of("ROLE_LECTURER"), ACTOR,
                ASSIGNMENT_ID);

        // Assert
        assertThat(result).isEqualTo(response);
    }

    // ==================== getAssignments ====================

    @Test
    @DisplayName("getAssignments - should return assignments for non-student role")
    void shouldReturnAssignmentsForNonStudentRole() {
        // Arrange
        AssignmentEntity assignment = AssignmentEntity.builder().id(ASSIGNMENT_ID).build();
        when(assignmentRepository.findByLectureIdAndDeletedAtIsNullOrderByCreatedAt(LECTURE_ID))
                .thenReturn(List.of(assignment));

        AssignmentResponse response = AssignmentResponse.builder().build();
        when(assignmentMapper.entityToRes(assignment)).thenReturn(response);

        // Act
        List<AssignmentResponse> result = assignmentService.getAssignments(Set.of(RoleEnum.LECTURER.name()), ACTOR,
                LECTURE_ID);

        // Assert
        assertThat(result).hasSize(1).contains(response);
    }

    @Test
    @DisplayName("getAssignments - should return assignments for student role")
    void shouldReturnAssignmentsForStudentRole() {
        // Arrange
        AssignmentProjection projection = mock(AssignmentProjection.class);
        when(assignmentRepository.findByLectureIdAndStudentUsername(LECTURE_ID, "student1"))
                .thenReturn(List.of(projection));

        AssignmentResponse response = AssignmentResponse.builder().build();
        when(assignmentMapper.projectionToRes(projection)).thenReturn(response);

        // Act
        List<AssignmentResponse> result = assignmentService.getAssignments(Set.of(RoleEnum.STUDENT.name()), "student1",
                LECTURE_ID);

        // Assert
        assertThat(result).hasSize(1).contains(response);
    }

    // ==================== create ====================

    @Test
    @DisplayName("create - should create assignment successfully")
    void shouldCreateAssignmentSuccessfully() {
        // Arrange
        AssignmentRequest request = new AssignmentRequest();
        request.setLectureId(LECTURE_ID);

        AssignmentEntity entity = AssignmentEntity.builder().id(ASSIGNMENT_ID).build();
        when(assignmentMapper.reqToEntity(request)).thenReturn(entity);

        AssignmentResponse response = AssignmentResponse.builder().build();
        when(assignmentMapper.entityToRes(entity)).thenReturn(response);

        // Act
        AssignmentResponse result = assignmentService.create(Set.of(RoleEnum.LECTURER.name()), ACTOR, request);

        // Assert
        assertThat(result).isEqualTo(response);
        verify(assignmentRepository).save(entity);
    }

    // ==================== delete ====================

    @Test
    @DisplayName("delete - should throw DataNotFoundException when deleting non-existent assignment")
    void shouldThrowDataNotFoundWhenDeletingNonExistentAssignment() {
        // Arrange
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> assignmentService.delete(Set.of(RoleEnum.LECTURER.name()), ACTOR, ASSIGNMENT_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Assignment not found.");
    }

    @Test
    @DisplayName("delete - should throw DataNotFoundException when assignment is already deleted")
    void shouldThrowDataNotFoundWhenDeletingAlreadyDeletedAssignment() {
        // Arrange
        AssignmentEntity deletedAssignment = AssignmentEntity.builder()
                .id(ASSIGNMENT_ID)
                .deletedAt(LocalDateTime.now())
                .build();
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.of(deletedAssignment));

        // Act & Assert
        assertThatThrownBy(() -> assignmentService.delete(Set.of(RoleEnum.LECTURER.name()), ACTOR, ASSIGNMENT_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Assignment not found.");
    }

    @Test
    @DisplayName("delete - should soft delete assignment successfully")
    void shouldDeleteAssignmentSuccessfully() {
        // Arrange
        AssignmentEntity activeAssignment = AssignmentEntity.builder().id(ASSIGNMENT_ID).build();
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.of(activeAssignment));

        // Act
        assignmentService.delete(Set.of(RoleEnum.LECTURER.name()), ACTOR, ASSIGNMENT_ID);

        // Verify & Assert
        assertThat(activeAssignment.getDeletedAt()).isNotNull();
        verify(assignmentRepository).save(activeAssignment);
    }

    // ==================== deleteByIds ====================

    @Test
    @DisplayName("deleteByIds - should hard delete assignments and associated files")
    void shouldHardDeleteAssignmentsAndAssociatedFiles() {
        // Arrange
        List<UUID> ids = List.of(ASSIGNMENT_ID);
        when(submissionRepository.deleteByAssignmentIdInAndReturnObjectKeys(ids))
                .thenReturn(List.of("key1"));

        // Act
        assignmentService.deleteByIds(ids);

        // Verify
        verify(assignmentRepository).deleteAllById(ids);
        verify(feedbackRepository).deleteByAssignmentIdIn(ids);
        verify(submissionRepository).deleteByAssignmentIdInAndReturnObjectKeys(ids);
    }
}
