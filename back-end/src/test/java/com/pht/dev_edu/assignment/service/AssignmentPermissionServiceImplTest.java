package com.pht.dev_edu.assignment.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/*
 * <analysis>
 * AssignmentPermissionServiceImpl
 * - checkViewAssignmentPermissionByLecture(Set<String> authorities, String actor, UUID lectureId)
 *   - paths:
 *       [P1: delegates to lecturePermissionService.checkViewPermissionByLecture]
 *   - planned tests:
 *       [shouldDelegateViewPermissionCheckByLecture -> P1]
 *
 * - checkViewAssignmentPermissionByAssignment(Set<String> authorities, String actor, UUID assignmentId)
 *   - branches:
 *       assignment not found -> DataNotFoundException
 *       assignment found -> delegates checkViewAssignmentPermissionByLecture
 *   - paths:
 *       [P1: assignment not found -> DataNotFoundException]
 *       [P2: assignment found -> delegates check]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenAssignmentNotFoundOnView -> P1]
 *       [shouldDelegateViewPermissionCheckByAssignment -> P2]
 *
 * - checkModifyAssignmentPermission(Set<String> authorities, String actor, UUID assignmentId)
 *   - branches:
 *       assignment not found -> DataNotFoundException
 *       authorities contains ADMIN -> returns early without check
 *       authorities non-ADMIN -> delegates lecturePermissionService.checkModifyPermissionByLecture
 *   - paths:
 *       [P1: assignment not found -> DataNotFoundException]
 *       [P2: ADMIN authority -> return early]
 *       [P3: non-ADMIN authority -> delegates check]
 *   - planned tests:
 *       [shouldThrowDataNotFoundWhenAssignmentNotFoundOnModify -> P1]
 *       [shouldAllowAdminWithoutLectureCheck -> P2]
 *       [shouldDelegateModifyPermissionCheckByAssignmentForNonAdmin -> P3]
 *
 * - checkModifyAssignmentPermissionByLecture(Set<String> authorities, String actor, UUID lectureId)
 *   - paths:
 *       [P1: delegates to lecturePermissionService.checkModifyPermissionByLecture]
 *   - planned tests:
 *       [shouldDelegateModifyPermissionCheckByLecture -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for AssignmentPermissionServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify authorization checks for viewing and modifying assignments in AssignmentPermissionServiceImpl.
 *
 * Test Scope
 * ----------
 * - checkViewAssignmentPermissionByLecture(Set<String>, String, UUID)
 * - checkViewAssignmentPermissionByAssignment(Set<String>, String, UUID)
 * - checkModifyAssignmentPermission(Set<String>, String, UUID)
 * - checkModifyAssignmentPermissionByLecture(Set<String>, String, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Delegation to lecture permission checks
 * ✓ Missing assignment entity handling (DataNotFoundException)
 * ✓ Admin bypass for assignment modification
 * ✓ Non-admin permission enforcement
 *
 * Mocked Dependencies
 * -------------------
 * - LecturePermissionService
 * - AssignmentRepository
 */

import com.pht.dev_edu.assignment.entity.AssignmentEntity;
import com.pht.dev_edu.assignment.repo.AssignmentRepository;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.lecture.service.LecturePermissionService;

@ExtendWith(MockitoExtension.class)
class AssignmentPermissionServiceImplTest {

    @Mock
    private LecturePermissionService lecturePermissionService;

    @Mock
    private AssignmentRepository assignmentRepository;

    @InjectMocks
    private AssignmentPermissionServiceImpl assignmentPermissionService;

    private static final String ACTOR = "user1";
    private static final UUID LECTURE_ID = UUID.randomUUID();
    private static final UUID ASSIGNMENT_ID = UUID.randomUUID();

    @Test
    @DisplayName("checkViewAssignmentPermissionByLecture - should delegate to lecturePermissionService")
    void shouldDelegateViewPermissionCheckByLecture() {
        // Arrange
        Set<String> authorities = Set.of("ROLE_STUDENT");

        // Act
        assignmentPermissionService.checkViewAssignmentPermissionByLecture(authorities, ACTOR, LECTURE_ID);

        // Verify
        verify(lecturePermissionService).checkViewPermissionByLecture(authorities, ACTOR, LECTURE_ID);
    }

    @Test
    @DisplayName("checkViewAssignmentPermissionByAssignment - should throw DataNotFoundException when assignment not found")
    void shouldThrowDataNotFoundWhenAssignmentNotFoundOnView() {
        // Arrange
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> assignmentPermissionService
                .checkViewAssignmentPermissionByAssignment(Set.of("ROLE_STUDENT"), ACTOR, ASSIGNMENT_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Assignment not found.");
    }

    @Test
    @DisplayName("checkViewAssignmentPermissionByAssignment - should delegate to lecture check when assignment found")
    void shouldDelegateViewPermissionCheckByAssignment() {
        // Arrange
        AssignmentEntity assignment = AssignmentEntity.builder()
                .id(ASSIGNMENT_ID)
                .lectureId(LECTURE_ID)
                .build();
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.of(assignment));

        Set<String> authorities = Set.of("ROLE_STUDENT");

        // Act
        assignmentPermissionService.checkViewAssignmentPermissionByAssignment(authorities, ACTOR, ASSIGNMENT_ID);

        // Verify
        verify(lecturePermissionService).checkViewPermissionByLecture(authorities, ACTOR, LECTURE_ID);
    }

    @Test
    @DisplayName("checkModifyAssignmentPermission - should throw DataNotFoundException when assignment not found")
    void shouldThrowDataNotFoundWhenAssignmentNotFoundOnModify() {
        // Arrange
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.empty());

        // Act & Assert
        assertThatThrownBy(() -> assignmentPermissionService.checkModifyAssignmentPermission(Set.of("ROLE_LECTURER"),
                ACTOR, ASSIGNMENT_ID))
                .isInstanceOf(DataNotFoundException.class)
                .hasMessageContaining("Assignment not found.");
    }

    @Test
    @DisplayName("checkModifyAssignmentPermission - should return early for ADMIN without checking lecture permission")
    void shouldAllowAdminWithoutLectureCheck() {
        // Arrange
        AssignmentEntity assignment = AssignmentEntity.builder()
                .id(ASSIGNMENT_ID)
                .lectureId(LECTURE_ID)
                .build();
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.of(assignment));

        Set<String> adminAuthorities = Set.of(RoleEnum.ADMIN.name());

        // Act
        assignmentPermissionService.checkModifyAssignmentPermission(adminAuthorities, ACTOR, ASSIGNMENT_ID);

        // Verify
        verify(lecturePermissionService, never()).checkModifyPermissionByLecture(any(), any(), any());
    }

    @Test
    @DisplayName("checkModifyAssignmentPermission - should delegate to lecture check for non-ADMIN")
    void shouldDelegateModifyPermissionCheckByAssignmentForNonAdmin() {
        // Arrange
        AssignmentEntity assignment = AssignmentEntity.builder()
                .id(ASSIGNMENT_ID)
                .lectureId(LECTURE_ID)
                .build();
        when(assignmentRepository.findById(ASSIGNMENT_ID)).thenReturn(Optional.of(assignment));

        Set<String> lecturerAuthorities = Set.of(RoleEnum.LECTURER.name());

        // Act
        assignmentPermissionService.checkModifyAssignmentPermission(lecturerAuthorities, ACTOR, ASSIGNMENT_ID);

        // Verify
        verify(lecturePermissionService).checkModifyPermissionByLecture(lecturerAuthorities, ACTOR, LECTURE_ID);
    }

    @Test
    @DisplayName("checkModifyAssignmentPermissionByLecture - should delegate to lecturePermissionService")
    void shouldDelegateModifyPermissionCheckByLecture() {
        // Arrange
        Set<String> authorities = Set.of(RoleEnum.LECTURER.name());

        // Act
        assignmentPermissionService.checkModifyAssignmentPermissionByLecture(authorities, ACTOR, LECTURE_ID);

        // Verify
        verify(lecturePermissionService).checkModifyPermissionByLecture(authorities, ACTOR, LECTURE_ID);
    }
}
