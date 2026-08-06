package com.pht.dev_edu.quiz.service;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.lecture.service.LecturePermissionService;
import com.pht.dev_edu.quiz.entity.QuizEntity;

/*
 * <analysis>
 * QuizAccessServiceImpl
 * - validateAccessByCourse(String username, Set<String> authorities, UUID courseId)
 *   - branches:
 *       always delegates to lecturePermissionService.checkViewPermissionByCourse
 *   - paths:
 *       [P1: delegate call]
 *   - planned tests:
 *       [validateAccessByCourse_DelegatesToLecturePermissionService -> P1]
 *
 * - validateAccessByQuiz(String username, Set<String> authorities, UUID quizId)
 *   - branches:
 *       authorities contain ADMIN -> return early
 *       authorities do not contain ADMIN -> delegate to validateAccessByCourse
 *   - paths:
 *       [P1: admin role bypass]
 *       [P2: non-admin course access check]
 *   - planned tests:
 *       [validateAccessByQuiz_WhenAdmin_ReturnsEarlyWithoutCheckingCoursePermission -> P1]
 *       [validateAccessByQuiz_WhenNotAdmin_ValidatesCourseAccess -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizAccessServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify quiz and course level permission validation logic.
 *
 * Test Scope
 * ----------
 * - validateAccessByCourse(String, Set<String>, UUID)
 * - validateAccessByQuiz(String, Set<String>, UUID)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Delegation of course-level permission checks to LecturePermissionService
 * ✓ ADMIN role bypass for quiz access validation
 * ✓ Non-ADMIN role course permission check for quiz access
 *
 * Mocked Dependencies
 * -------------------
 * - QuizService
 * - LecturePermissionService
 */
@ExtendWith(MockitoExtension.class)
class QuizAccessServiceImplTest {

    @Mock
    QuizService quizService;

    @Mock
    LecturePermissionService lecturePermissionService;

    @InjectMocks
    QuizAccessServiceImpl quizAccessService;

    private String username;
    private UUID courseId;
    private UUID quizId;

    @BeforeEach
    void setUp() {
        username = "lecturer1";
        courseId = UUID.randomUUID();
        quizId = UUID.randomUUID();
    }

    @Test
    @DisplayName("validateAccessByCourse - should delegate to lecturePermissionService")
    void validateAccessByCourse_DelegatesToLecturePermissionService() {
        Set<String> authorities = Set.of(RoleEnum.LECTURER.name());

        quizAccessService.validateAccessByCourse(username, authorities, courseId);

        verify(lecturePermissionService).checkViewPermissionByCourse(authorities, username, courseId);
    }

    @Test
    @DisplayName("validateAccessByQuiz - when ADMIN role, should return early without checking course permission")
    void validateAccessByQuiz_WhenAdmin_ReturnsEarlyWithoutCheckingCoursePermission() {
        Set<String> authorities = Set.of(RoleEnum.ADMIN.name());
        QuizEntity quiz = QuizEntity.builder().id(quizId).courseId(courseId).build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        quizAccessService.validateAccessByQuiz(username, authorities, quizId);

        verify(quizService).getQuizEntityOrThrow(quizId);
        verify(lecturePermissionService, never()).checkViewPermissionByCourse(authorities, username, courseId);
    }

    @Test
    @DisplayName("validateAccessByQuiz - when not ADMIN, should validate course access")
    void validateAccessByQuiz_WhenNotAdmin_ValidatesCourseAccess() {
        Set<String> authorities = Set.of(RoleEnum.STUDENT.name());
        QuizEntity quiz = QuizEntity.builder().id(quizId).courseId(courseId).build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        quizAccessService.validateAccessByQuiz(username, authorities, quizId);

        verify(quizService).getQuizEntityOrThrow(quizId);
        verify(lecturePermissionService).checkViewPermissionByCourse(authorities, username, courseId);
    }
}
