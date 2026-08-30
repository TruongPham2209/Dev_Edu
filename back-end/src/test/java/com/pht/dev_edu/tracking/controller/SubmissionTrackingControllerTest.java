package com.pht.dev_edu.tracking.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.pht.dev_edu.assignment.dto.SubmissionLogResponse;
import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.tracking.service.SubmissionService;

/*
 * <analysis>
 * SubmissionTrackingController
 * - getSubmissionsTracking(UUID assignmentId, String studentUsername, int page)
 *   - branches:
 *       if authorities contain STUDENT -> force studentUsername to current authenticated user
 *       if authorities do NOT contain STUDENT and studentUsername == null -> throw BadRequestException
 *       if authorities do NOT contain STUDENT and studentUsername != null -> query for specified studentUsername
 *   - paths:
 *       [P1: STUDENT role -> studentUsername automatically set to caller username]
 *       [P2: Non-STUDENT role with studentUsername -> query for target student]
 *       [P3: Non-STUDENT role without studentUsername -> BadRequestException]
 *   - planned tests:
 *       [shouldGetSubmissionsTrackingForStudentRole -> P1]
 *       [shouldGetSubmissionsTrackingForNonStudentRole -> P2]
 *       [shouldThrowBadRequestWhenStudentUsernameNullForNonStudent -> P3]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for SubmissionTrackingController
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify web layer authorization scoping, role-based student parameter overrides,
 * and input validation in SubmissionTrackingController.
 *
 * Test Scope
 * ----------
 * - getSubmissionsTracking()
 *
 * Covered Scenarios
 * -----------------
 * ✓ STUDENT role automatically binds query to authenticated user's own submissions
 * ✓ LECTURER/ADMIN role queries specific student submissions when provided
 * ✓ LECTURER/ADMIN role throws BadRequestException when studentUsername is missing
 *
 * Mocked Dependencies
 * -------------------
 * - SubmissionService
 * - SecurityContextUtils (static)
 */
@ExtendWith(MockitoExtension.class)
class SubmissionTrackingControllerTest {

    @Mock
    private SubmissionService submissionService;

    @InjectMocks
    private SubmissionTrackingController controller;

    private MockedStatic<SecurityContextUtils> securityContextUtilsMock;

    @BeforeEach
    void setUp() {
        securityContextUtilsMock = mockStatic(SecurityContextUtils.class);
    }

    @AfterEach
    void tearDown() {
        securityContextUtilsMock.close();
    }

    @Test
    @DisplayName("getSubmissionsTracking - student role should automatically override studentUsername with current username")
    void shouldGetSubmissionsTrackingForStudentRole() {
        // Arrange
        UUID assignmentId = UUID.randomUUID();
        String currentUsername = "student_user";
        Set<String> authorities = Set.of(RoleEnum.STUDENT.name());

        securityContextUtilsMock.when(SecurityContextUtils::getCurrentUsernameForController)
                .thenReturn(currentUsername);
        securityContextUtilsMock.when(SecurityContextUtils::getCurrentUserAuthorities).thenReturn(authorities);

        CustomPaging<SubmissionLogResponse> mockPaging = new CustomPaging<>();
        when(submissionService.getSubmissionLogsByAssignmentIdForStudent(authorities, currentUsername, currentUsername,
                assignmentId, 0))
                .thenReturn(mockPaging);

        // Act
        ResponseEntity<ApiResponse> response = controller.getSubmissionsTracking(assignmentId, "other_student", 0);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(submissionService).getSubmissionLogsByAssignmentIdForStudent(authorities, currentUsername,
                currentUsername, assignmentId, 0);
    }

    @Test
    @DisplayName("getSubmissionsTracking - non-student role should use provided studentUsername")
    void shouldGetSubmissionsTrackingForNonStudentRole() {
        // Arrange
        UUID assignmentId = UUID.randomUUID();
        String teacherUsername = "teacher_user";
        String targetStudent = "student_user";
        Set<String> authorities = Set.of(RoleEnum.LECTURER.name());

        securityContextUtilsMock.when(SecurityContextUtils::getCurrentUsernameForController)
                .thenReturn(teacherUsername);
        securityContextUtilsMock.when(SecurityContextUtils::getCurrentUserAuthorities).thenReturn(authorities);

        CustomPaging<SubmissionLogResponse> mockPaging = new CustomPaging<>();
        when(submissionService.getSubmissionLogsByAssignmentIdForStudent(authorities, teacherUsername, targetStudent,
                assignmentId, 0))
                .thenReturn(mockPaging);

        // Act
        ResponseEntity<ApiResponse> response = controller.getSubmissionsTracking(assignmentId, targetStudent, 0);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        verify(submissionService).getSubmissionLogsByAssignmentIdForStudent(authorities, teacherUsername, targetStudent,
                assignmentId, 0);
    }

    @Test
    @DisplayName("getSubmissionsTracking - non-student role without studentUsername should throw BadRequestException")
    void shouldThrowBadRequestWhenStudentUsernameNullForNonStudent() {
        // Arrange
        UUID assignmentId = UUID.randomUUID();
        String teacherUsername = "teacher_user";
        Set<String> authorities = Set.of(RoleEnum.LECTURER.name());

        securityContextUtilsMock.when(SecurityContextUtils::getCurrentUsernameForController)
                .thenReturn(teacherUsername);
        securityContextUtilsMock.when(SecurityContextUtils::getCurrentUserAuthorities).thenReturn(authorities);

        // Act & Assert
        assertThatThrownBy(() -> controller.getSubmissionsTracking(assignmentId, null, 0))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Student username is required for non-student users");
    }
}
