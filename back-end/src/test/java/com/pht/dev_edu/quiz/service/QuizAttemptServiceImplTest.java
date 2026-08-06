package com.pht.dev_edu.quiz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.response.QuizAttemptReviewResponse;
import com.pht.dev_edu.quiz.dto.response.SubmitAttemptResponse;
import com.pht.dev_edu.quiz.entity.QuizAttemptEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionOptionEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.QuizAssignmentRepo;
import com.pht.dev_edu.quiz.repo.QuizAttemptAnswerLogRepo;
import com.pht.dev_edu.quiz.repo.QuizAttemptAnswerRepo;
import com.pht.dev_edu.quiz.repo.QuizAttemptRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionOptionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;

/*
 * <analysis>
 * QuizAttemptServiceImpl
 * - submitAttempt(UUID attemptId, String username)
 *   - branches:
 *       attempt already submitted/graded -> returns existing status without re-saving
 *       attempt auto-graded only (no essays) -> status = GRADED, clears activeSessionToken
 *       attempt contains essay questions -> status = GRADING
 *   - paths:
 *       [P1: auto-graded only attempt submission]
 *       [P2: attempt with essay questions submission]
 *       [P3: already submitted attempt idempotent submission]
 *   - planned tests:
 *       [submitAttempt_AutoGradedOnly_TransitionsToGraded -> P1]
 *       [submitAttempt_WithEssayQuestion_TransitionsToGrading -> P2]
 *       [submitAttempt_AlreadySubmitted_ReturnsExistingStatus -> P3]
 *
 * - getAttemptReview(UUID attemptId, String username, boolean isLecturer)
 *   - branches:
 *       attempt status == IN_PROGRESS -> BadRequestException
 *       attempt status submitted/graded -> returns review data
 *   - paths:
 *       [P1: attempt in progress review request]
 *       [P2: attempt submitted review request]
 *   - planned tests:
 *       [getAttemptReview_WhenInProgress_ThrowsBadRequest -> P1]
 *       [getAttemptReview_WhenSubmitted_ReturnsReviewData -> P2]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizAttemptServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify quiz attempt submission, auto vs manual grading status transitions, and attempt review lookup rules.
 *
 * Test Scope
 * ----------
 * - submitAttempt(UUID, String)
 * - getAttemptReview(UUID, String, boolean)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Auto-grading attempt submission (transitions to GRADED and revokes active session token)
 * ✓ Essay question attempt submission (transitions to GRADING for manual teacher evaluation)
 * ✓ Idempotent submission for already submitted/graded attempts
 * ✓ Review access restriction when attempt is still IN_PROGRESS
 * ✓ Review data retrieval for submitted/graded attempts
 *
 * Mocked Dependencies
 * -------------------
 * - QuizAttemptRepo
 * - QuizAssignmentRepo
 * - QuizQuestionRepo
 * - QuizQuestionOptionRepo
 * - QuizAttemptAnswerRepo
 * - QuizAttemptAnswerLogRepo
 * - QuizAccessService
 * - QuizAuditService
 * - KafkaTemplate
 * - QuizMapper
 * - ObjectMapper (Spy)
 */
@ExtendWith(MockitoExtension.class)
class QuizAttemptServiceImplTest {

    @Mock
    QuizAttemptRepo attemptRepo;
    @Mock
    QuizAssignmentRepo assignmentRepo;
    @Mock
    QuizQuestionRepo questionRepo;
    @Mock
    QuizQuestionOptionRepo optionRepo;
    @Mock
    QuizAttemptAnswerRepo answerRepo;
    @Mock
    QuizAttemptAnswerLogRepo answerLogRepo;
    @Mock
    QuizAccessService quizAccessService;
    @Mock
    QuizAuditService auditService;
    @Mock
    KafkaTemplate<String, Object> kafkaTemplate;
    @Mock
    QuizMapper quizMapper;

    @Spy
    ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    QuizAttemptServiceImpl attemptService;

    private UUID attemptId;
    private UUID assignmentId;
    private UUID quizId;
    private UUID question1Id;
    private UUID option1Id;
    private String studentUsername;

    @BeforeEach
    void setUp() {
        attemptId = UUID.randomUUID();
        assignmentId = UUID.randomUUID();
        quizId = UUID.randomUUID();
        question1Id = UUID.randomUUID();
        option1Id = UUID.randomUUID();
        studentUsername = "student1";
    }

    @Test
    @DisplayName("submitAttempt - when auto-graded only questions, should transition attempt to GRADED")
    void submitAttempt_AutoGradedOnly_TransitionsToGraded() throws Exception {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .assignmentId(assignmentId)
                .quizId(quizId)
                .studentUsername(studentUsername)
                .status(AttemptStatus.IN_PROGRESS)
                .maxScore(new BigDecimal("10.00"))
                .questionOrder(objectMapper.writeValueAsString(List.of(question1Id)))
                .build();

        QuizQuestionEntity q1 = QuizQuestionEntity.builder()
                .id(question1Id)
                .quizId(quizId)
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(new BigDecimal("10.00"))
                .build();

        QuizQuestionOptionEntity opt1 = QuizQuestionOptionEntity.builder()
                .id(option1Id)
                .questionId(question1Id)
                .isCorrect(true)
                .build();

        when(attemptRepo.findByIdForUpdate(attemptId)).thenReturn(Optional.of(attempt));
        when(answerLogRepo.findByAttemptIdOrderByClientSeqAsc(attemptId)).thenReturn(Collections.emptyList());
        when(answerRepo.findByAttemptId(attemptId)).thenReturn(Collections.emptyList());
        when(questionRepo.findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(quizId)).thenReturn(List.of(q1));
        when(optionRepo.findByQuestionIdInAndIsCorrectTrueAndDeletedAtIsNull(any())).thenReturn(List.of(opt1));

        SubmitAttemptResponse response = attemptService.submitAttempt(attemptId, studentUsername);

        assertNotNull(response);
        assertEquals(AttemptStatus.GRADED, response.getStatus());
        verify(attemptRepo).saveAndFlush(attempt);
        assertNull(attempt.getActiveSessionToken());
    }

    @Test
    @DisplayName("submitAttempt - when attempt contains essay questions, should transition attempt to GRADING")
    void submitAttempt_WithEssayQuestion_TransitionsToGrading() throws Exception {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .assignmentId(assignmentId)
                .quizId(quizId)
                .studentUsername(studentUsername)
                .status(AttemptStatus.IN_PROGRESS)
                .maxScore(new BigDecimal("10.00"))
                .questionOrder(objectMapper.writeValueAsString(List.of(question1Id)))
                .build();

        QuizQuestionEntity q1 = QuizQuestionEntity.builder()
                .id(question1Id)
                .quizId(quizId)
                .questionType(QuestionType.ESSAY)
                .points(new BigDecimal("10.00"))
                .build();

        when(attemptRepo.findByIdForUpdate(attemptId)).thenReturn(Optional.of(attempt));
        when(answerLogRepo.findByAttemptIdOrderByClientSeqAsc(attemptId)).thenReturn(Collections.emptyList());
        when(answerRepo.findByAttemptId(attemptId)).thenReturn(Collections.emptyList());
        when(questionRepo.findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(quizId)).thenReturn(List.of(q1));
        when(optionRepo.findByQuestionIdInAndIsCorrectTrueAndDeletedAtIsNull(any()))
                .thenReturn(Collections.emptyList());

        SubmitAttemptResponse response = attemptService.submitAttempt(attemptId, studentUsername);

        assertNotNull(response);
        assertEquals(AttemptStatus.GRADING, response.getStatus());
    }

    @Test
    @DisplayName("submitAttempt - when attempt is already submitted, should return existing status without re-saving")
    void submitAttempt_AlreadySubmitted_ReturnsExistingStatus() {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .status(AttemptStatus.GRADED)
                .totalScore(new BigDecimal("10.00"))
                .maxScore(new BigDecimal("10.00"))
                .submittedAt(LocalDateTime.now())
                .build();

        when(attemptRepo.findByIdForUpdate(attemptId)).thenReturn(Optional.of(attempt));

        SubmitAttemptResponse response = attemptService.submitAttempt(attemptId, studentUsername);

        assertEquals(AttemptStatus.GRADED, response.getStatus());
        verify(attemptRepo, never()).save(any());
    }

    @Test
    @DisplayName("getAttemptReview - when attempt is IN_PROGRESS, should throw BadRequestException")
    void getAttemptReview_WhenInProgress_ThrowsBadRequest() {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .studentUsername(studentUsername)
                .status(AttemptStatus.IN_PROGRESS)
                .build();

        when(attemptRepo.findById(attemptId)).thenReturn(Optional.of(attempt));

        assertThrows(BadRequestException.class,
                () -> attemptService.getAttemptReview(attemptId, studentUsername, false));
    }

    @Test
    @DisplayName("getAttemptReview - when attempt is submitted, should return review data")
    void getAttemptReview_WhenSubmitted_ReturnsReviewData() {
        QuizAttemptEntity attempt = QuizAttemptEntity.builder()
                .id(attemptId)
                .assignmentId(assignmentId)
                .quizId(quizId)
                .studentUsername(studentUsername)
                .status(AttemptStatus.SUBMITTED)
                .maxScore(new BigDecimal("10.00"))
                .build();

        QuizQuestionEntity q1 = QuizQuestionEntity.builder()
                .id(question1Id)
                .quizId(quizId)
                .questionType(QuestionType.SINGLE_CHOICE)
                .points(new BigDecimal("10.00"))
                .content("What is 1+1?")
                .build();

        when(attemptRepo.findById(attemptId)).thenReturn(Optional.of(attempt));
        when(questionRepo.findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(quizId)).thenReturn(List.of(q1));
        when(answerRepo.findByAttemptId(attemptId)).thenReturn(Collections.emptyList());
        when(optionRepo.findByQuestionIdInAndDeletedAtIsNullOrderByOrderIndexAsc(any()))
                .thenReturn(Collections.emptyList());

        QuizAttemptReviewResponse review = attemptService.getAttemptReview(attemptId, studentUsername, false);

        assertNotNull(review);
        assertEquals(AttemptStatus.SUBMITTED, review.getStatus());
        assertEquals(1, review.getAnswers().size());
    }
}
