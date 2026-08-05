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
        verify(attemptRepo).save(attempt);
        assertNull(attempt.getActiveSessionToken());
    }

    @Test
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
