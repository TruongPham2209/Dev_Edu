package com.pht.dev_edu.quiz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.projection.QuizEssaySubmissionProjection;
import com.pht.dev_edu.quiz.dto.request.GradeEssayRequest;
import com.pht.dev_edu.quiz.dto.response.AttemptResultResponse;
import com.pht.dev_edu.quiz.dto.response.QuizEssaySubmissionResponse;
import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerEntity;
import com.pht.dev_edu.quiz.entity.QuizAttemptEntity;
import com.pht.dev_edu.quiz.entity.QuizEssayGradingEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.repo.QuizAttemptAnswerRepo;
import com.pht.dev_edu.quiz.repo.QuizAttemptRepo;
import com.pht.dev_edu.quiz.repo.QuizEssayGradingRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;

import java.util.concurrent.Executor;
import com.pht.dev_edu.notification.service.NotificationPersonalService;

/*
 * <analysis>
 * QuizGradingServiceImpl
 * - getEssaySubmissions(UUID quizId, String essayStatus, String nextCursor, String graderUsername, Set<String> authorities)
 *   - branches:
 *       validates access and fetches essay submission projections
 *   - paths:
 *       [P1: return paged essay submissions]
 *   - planned tests:
 *       [getEssaySubmissions_ReturnsPagedResult -> P1]
 *
 * - gradeEssayAnswer(UUID attemptId, UUID questionId, GradeEssayRequest request, String graderUsername, Set<String> authorities)
 *   - branches:
 *       attempt not found -> DataNotFoundException
 *       attempt status != GRADING -> BadRequestException
 *       question not found -> DataNotFoundException
 *       questionType != ESSAY -> BadRequestException
 *       awardedPoints > maxPoints -> BadRequestException
 *       ungradedCount > 0 -> remains GRADING
 *       ungradedCount == 0 -> transitions to GRADED and updates totalScore
 *   - paths:
 *       [P1: attempt not found]
 *       [P2: attempt status invalid]
 *       [P3: question not found]
 *       [P4: question type invalid]
 *       [P5: awarded points exceed max]
 *       [P6: grade essay, ungraded remain]
 *       [P7: grade essay, all graded]
 *   - planned tests:
 *       [gradeEssayAnswer_AttemptNotFound_ThrowsDataNotFoundException -> P1]
 *       [gradeEssayAnswer_StatusNotGrading_ThrowsBadRequestException -> P2]
 *       [gradeEssayAnswer_QuestionNotFound_ThrowsDataNotFoundException -> P3]
 *       [gradeEssayAnswer_QuestionNotEssay_ThrowsBadRequestException -> P4]
 *       [gradeEssayAnswer_AwardedPointsExceedMax_ThrowsBadRequestException -> P5]
 *       [gradeEssayAnswer_UngradedEssaysRemain_StaysInGradingStatus -> P6]
 *       [gradeEssayAnswer_AllEssaysGraded_TransitionsToGradedAndCalculatesTotalScore -> P7]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizGradingServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify manual essay grading workflows, point calculations, and attempt status transitions.
 *
 * Test Scope
 * ----------
 * - getEssaySubmissions(UUID, String, String, String, Set<String>)
 * - gradeEssayAnswer(UUID, UUID, GradeEssayRequest, String, Set<String>)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Cursor pagination for essay submissions
 * ✓ Guard clause validations (attempt existence, status = GRADING, questionType = ESSAY, points boundary)
 * ✓ Essay grading history recording in QuizEssayGradingEntity
 * ✓ Partial grading (attempt remains in GRADING status when ungraded essays remain)
 * ✓ Final grading completion (total score aggregation & transition to GRADED status)
 *
 * Mocked Dependencies
 * -------------------
 * - QuizAttemptRepo
 * - QuizQuestionRepo
 * - QuizAttemptAnswerRepo
 * - QuizEssayGradingRepo
 * - QuizAccessService
 * - QuizAttemptService
 * - QuizAuditService
 * - Executor
 * - NotificationPersonalService
 */
@ExtendWith(MockitoExtension.class)
class QuizGradingServiceImplTest {

    @Mock
    QuizAttemptRepo attemptRepo;
    @Mock
    QuizQuestionRepo questionRepo;
    @Mock
    QuizAttemptAnswerRepo answerRepo;
    @Mock
    QuizEssayGradingRepo essayGradingRepo;
    @Mock
    Executor executor;
    @Mock
    NotificationPersonalService notificationPersonalService;
    @Mock
    QuizAccessService quizAccessService;
    @Mock
    QuizAttemptService attemptService;
    @Mock
    QuizAuditService auditService;

    @InjectMocks
    QuizGradingServiceImpl gradingService;

    private UUID quizId;
    private UUID attemptId;
    private UUID questionId;
    private String graderUsername;
    private Set<String> authorities;

    @BeforeEach
    void setUp() {
        quizId = UUID.randomUUID();
        attemptId = UUID.randomUUID();
        questionId = UUID.randomUUID();
        graderUsername = "lecturer1";
        authorities = Set.of(RoleEnum.LECTURER.name());
    }

    @Test
    @DisplayName("getEssaySubmissions - should return paged essay submission responses")
    void getEssaySubmissions_ReturnsPagedResult() {
        QuizEssaySubmissionProjection projection = mock(QuizEssaySubmissionProjection.class);
        when(projection.getAttemptAnswerId()).thenReturn(UUID.randomUUID());
        when(projection.getSubmittedAt()).thenReturn(LocalDateTime.now());
        when(projection.getAttemptId()).thenReturn(attemptId);
        when(projection.getQuestionId()).thenReturn(questionId);

        when(answerRepo.findEssaySubmissionsByQuizIdAndStatusAndCursor(
                eq(quizId), eq("ALL"), any(), any(), eq(11)))
                .thenReturn(List.of(projection));

        CustomPaging<QuizEssaySubmissionResponse> result = gradingService.getEssaySubmissions(
                quizId, "ALL", null, graderUsername, authorities);

        assertNotNull(result);
        assertEquals(1, result.getContents().size());
        verify(quizAccessService).validateAccessByQuiz(graderUsername, authorities, quizId);
    }

    @Test
    @DisplayName("gradeEssayAnswer - when attempt not found, should throw DataNotFoundException")
    void gradeEssayAnswer_AttemptNotFound_ThrowsDataNotFoundException() {
        when(attemptRepo.findById(attemptId)).thenReturn(Optional.empty());

        GradeEssayRequest request = new GradeEssayRequest();
        request.setAwardedPoints(new BigDecimal("5.00"));

        assertThrows(DataNotFoundException.class,
                () -> gradingService.gradeEssayAnswer(attemptId, questionId, request, graderUsername, authorities));
    }

    @Test
    @DisplayName("gradeEssayAnswer - when attempt status is not GRADING, should throw BadRequestException")
    void gradeEssayAnswer_StatusNotGrading_ThrowsBadRequestException() {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .quizId(quizId)
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        when(attemptRepo.findById(attemptId)).thenReturn(Optional.of(attempt));

        GradeEssayRequest request = new GradeEssayRequest();
        request.setAwardedPoints(new BigDecimal("5.00"));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> gradingService.gradeEssayAnswer(attemptId, questionId, request, graderUsername, authorities));

        assertEquals("Attempt is not in GRADING status.", ex.getMessage());
    }

    @Test
    @DisplayName("gradeEssayAnswer - when question not found, should throw DataNotFoundException")
    void gradeEssayAnswer_QuestionNotFound_ThrowsDataNotFoundException() {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .quizId(quizId)
                .status(AttemptStatus.GRADING)
                .build();

        when(attemptRepo.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(questionRepo.findByIdAndDeletedAtIsNull(questionId)).thenReturn(Optional.empty());

        GradeEssayRequest request = new GradeEssayRequest();
        request.setAwardedPoints(new BigDecimal("5.00"));

        assertThrows(DataNotFoundException.class,
                () -> gradingService.gradeEssayAnswer(attemptId, questionId, request, graderUsername, authorities));
    }

    @Test
    @DisplayName("gradeEssayAnswer - when question type is not ESSAY, should throw BadRequestException")
    void gradeEssayAnswer_QuestionNotEssay_ThrowsBadRequestException() {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .quizId(quizId)
                .status(AttemptStatus.GRADING)
                .build();

        QuizQuestionEntity question = QuizQuestionEntity.builder()
                .id(questionId)
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(new BigDecimal("10.00"))
                .build();

        when(attemptRepo.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(questionRepo.findByIdAndDeletedAtIsNull(questionId)).thenReturn(Optional.of(question));

        GradeEssayRequest request = new GradeEssayRequest();
        request.setAwardedPoints(new BigDecimal("5.00"));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> gradingService.gradeEssayAnswer(attemptId, questionId, request, graderUsername, authorities));

        assertEquals("Only ESSAY questions can be manually graded.", ex.getMessage());
    }

    @Test
    @DisplayName("gradeEssayAnswer - when awarded points exceed question max points, should throw BadRequestException")
    void gradeEssayAnswer_AwardedPointsExceedMax_ThrowsBadRequestException() {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .quizId(quizId)
                .status(AttemptStatus.GRADING)
                .build();

        QuizQuestionEntity question = QuizQuestionEntity.builder()
                .id(questionId)
                .questionType(QuestionType.ESSAY)
                .points(new BigDecimal("10.00"))
                .build();

        when(attemptRepo.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(questionRepo.findByIdAndDeletedAtIsNull(questionId)).thenReturn(Optional.of(question));

        GradeEssayRequest request = new GradeEssayRequest();
        request.setAwardedPoints(new BigDecimal("15.00"));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> gradingService.gradeEssayAnswer(attemptId, questionId, request, graderUsername, authorities));

        assertEquals("Awarded points (15.00) cannot exceed maximum question points (10.00).", ex.getMessage());
    }

    @Test
    @DisplayName("gradeEssayAnswer - when ungraded essays remain, attempt status should remain GRADING")
    void gradeEssayAnswer_UngradedEssaysRemain_StaysInGradingStatus() {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .quizId(quizId)
                .status(AttemptStatus.GRADING)
                .build();

        QuizQuestionEntity question = QuizQuestionEntity.builder()
                .id(questionId)
                .questionType(QuestionType.ESSAY)
                .points(new BigDecimal("10.00"))
                .build();

        QuizAttemptAnswerEntity answer = QuizAttemptAnswerEntity.builder()
                .id(UUID.randomUUID())
                .attemptId(attemptId)
                .questionId(questionId)
                .build();

        when(attemptRepo.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(questionRepo.findByIdAndDeletedAtIsNull(questionId)).thenReturn(Optional.of(question));
        when(answerRepo.findByAttemptIdAndQuestionId(attemptId, questionId)).thenReturn(Optional.of(answer));
        when(answerRepo.countByAttemptIdAndQuestionTypeAndAwardedPointsIsNull(attemptId, QuestionType.ESSAY)).thenReturn(1);
        when(attemptService.getAttemptResult(attemptId, graderUsername, true))
                .thenReturn(AttemptResultResponse.builder().attemptId(attemptId).build());

        GradeEssayRequest request = new GradeEssayRequest();
        request.setAwardedPoints(new BigDecimal("8.00"));
        request.setFeedback("Good analysis");

        AttemptResultResponse result = gradingService.gradeEssayAnswer(attemptId, questionId, request, graderUsername, authorities);

        assertNotNull(result);
        assertEquals(AttemptStatus.GRADING, attempt.getStatus());
        verify(answerRepo).save(answer);
        verify(essayGradingRepo).save(any(QuizEssayGradingEntity.class));
        verify(auditService).log(eq("ATTEMPT_ANSWER"), any(), eq(QuizAuditAction.GRADE), eq(graderUsername), any(), any(), eq("Good analysis"));
    }

    @Test
    @DisplayName("gradeEssayAnswer - when all essays graded, should transition attempt to GRADED and calculate total score")
    void gradeEssayAnswer_AllEssaysGraded_TransitionsToGradedAndCalculatesTotalScore() {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .quizId(quizId)
                .status(AttemptStatus.GRADING)
                .build();

        QuizQuestionEntity question = QuizQuestionEntity.builder()
                .id(questionId)
                .questionType(QuestionType.ESSAY)
                .points(new BigDecimal("10.00"))
                .build();

        QuizAttemptAnswerEntity answer1 = QuizAttemptAnswerEntity.builder()
                .id(UUID.randomUUID())
                .attemptId(attemptId)
                .questionId(questionId)
                .awardedPoints(new BigDecimal("8.00"))
                .build();

        QuizAttemptAnswerEntity answer2 = QuizAttemptAnswerEntity.builder()
                .id(UUID.randomUUID())
                .attemptId(attemptId)
                .questionId(UUID.randomUUID())
                .awardedPoints(new BigDecimal("9.00"))
                .build();

        when(attemptRepo.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(questionRepo.findByIdAndDeletedAtIsNull(questionId)).thenReturn(Optional.of(question));
        when(answerRepo.findByAttemptIdAndQuestionId(attemptId, questionId)).thenReturn(Optional.of(answer1));
        when(answerRepo.countByAttemptIdAndQuestionTypeAndAwardedPointsIsNull(attemptId, QuestionType.ESSAY)).thenReturn(0);
        when(answerRepo.findByAttemptId(attemptId)).thenReturn(List.of(answer1, answer2));
        when(attemptService.getAttemptResult(attemptId, graderUsername, true))
                .thenReturn(AttemptResultResponse.builder().attemptId(attemptId).totalScore(new BigDecimal("17.00")).build());

        GradeEssayRequest request = new GradeEssayRequest();
        request.setAwardedPoints(new BigDecimal("8.00"));
        request.setFeedback("Excellent work");

        AttemptResultResponse result = gradingService.gradeEssayAnswer(attemptId, questionId, request, graderUsername, authorities);

        assertNotNull(result);
        assertEquals(AttemptStatus.GRADED, attempt.getStatus());
        assertEquals(new BigDecimal("17.00"), attempt.getTotalScore());
        verify(attemptRepo).save(attempt);
    }
}
