package com.pht.dev_edu.quiz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mapstruct.factory.Mappers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.dto.request.QuizQuestionOptionRequest;
import com.pht.dev_edu.quiz.dto.request.QuizQuestionRequest;
import com.pht.dev_edu.quiz.dto.response.QuizQuestionResponse;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionOptionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionTypeConfigEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.QuizAssignmentRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionOptionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionTypeConfigRepo;
import com.pht.dev_edu.quiz.repo.QuizRepo;

/*
 * <analysis>
 * QuizQuestionServiceImpl
 * - addQuestion(UUID quizId, QuizQuestionRequest request, String username, Set<String> authorities)
 *   - branches:
 *       typeConfig missing -> BadRequestException
 *       currentCount >= requiredCount -> BadRequestException
 *       ESSAY has options -> BadRequestException
 *       SINGLE_CHOICE correctCount != 1 -> BadRequestException
 *       MULTIPLE_CHOICE correctCount < 2 -> BadRequestException
 *       quiz.status != DRAFT -> resets status to DRAFT and saves
 *       success -> save question & options
 *   - paths:
 *       [P1: missing type config]
 *       [P2: count limit reached]
 *       [P3: essay has options]
 *       [P4: single choice invalid correct count]
 *       [P5: multiple choice invalid correct count]
 *       [P6: successful addition and draft status reset]
 *   - planned tests:
 *       [addQuestion_MissingTypeConfig_ThrowsBadRequestException -> P1]
 *       [addQuestion_ReachesCountLimit_ThrowsBadRequestException -> P2]
 *       [addQuestion_EssayWithOptions_ThrowsBadRequestException -> P3]
 *       [addQuestion_SingleChoiceInvalidCorrectCount_ThrowsBadRequestException -> P4]
 *       [addQuestion_MultipleChoiceInvalidCorrectCount_ThrowsBadRequestException -> P5]
 *       [addQuestion_Success_ResetsQuizToDraft -> P6]
 *
 * - updateQuestion(UUID quizId, UUID questionId, QuizQuestionRequest request, String username, Set<String> authorities)
 *   - branches:
 *       question not found -> DataNotFoundException
 *       question does not belong to quiz -> BadRequestException
 *       success -> update question, delete old options, save new options
 *   - paths:
 *       [P1: question not found]
 *       [P2: question does not belong to quiz]
 *       [P3: successful update]
 *   - planned tests:
 *       [updateQuestion_QuestionNotFound_ThrowsDataNotFoundException -> P1]
 *       [updateQuestion_QuestionDoesNotBelongToQuiz_ThrowsBadRequestException -> P2]
 *       [updateQuestion_Success -> P3]
 *
 * - deleteQuestion(UUID quizId, UUID questionId, String username, Set<String> authorities)
 *   - branches:
 *       question soft deleted
 *   - paths:
 *       [P1: successful soft delete]
 *   - planned tests:
 *       [deleteQuestion_Success -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizQuestionServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify quiz question creation, update, deletion, and option validation rules.
 *
 * Test Scope
 * ----------
 * - addQuestion(UUID, QuizQuestionRequest, String, Set<String>)
 * - updateQuestion(UUID, UUID, QuizQuestionRequest, String, Set<String>)
 * - deleteQuestion(UUID, UUID, String, Set<String>)\n *
 * Covered Scenarios
 * -----------------
 * ✓ Question type configuration count limit enforcement
 * ✓ ESSAY question option restriction (must not have choices)
 * ✓ SINGLE_CHOICE correct option count validation (exactly 1)
 * ✓ MULTIPLE_CHOICE correct option count validation (at least 2)
 * ✓ Quiz status auto-reset to DRAFT when modifying questions
 * ✓ Question updates (deleting old options and replacing with new)
 * ✓ Soft-deletion of quiz questions
 *
 * Mocked Dependencies
 * -------------------
 * - QuizQuestionTypeConfigRepo
 * - QuizQuestionRepo
 * - QuizQuestionOptionRepo
 * - QuizAssignmentRepo
 * - QuizRepo
 * - QuizMapper (Spy)
 * - QuizService
 * - RedisUtils (static mock)
 */
@ExtendWith(MockitoExtension.class)
class QuizQuestionServiceImplTest {

    @Mock
    QuizQuestionTypeConfigRepo typeConfigRepo;
    @Mock
    QuizQuestionRepo questionRepo;
    @Mock
    QuizQuestionOptionRepo optionRepo;
    @Mock
    QuizAssignmentRepo assignmentRepo;
    @Mock
    QuizRepo quizRepo;
    @Spy
    private QuizMapper quizMapper = Mappers.getMapper(QuizMapper.class);
    @Mock
    QuizService quizService;

    @InjectMocks
    QuizQuestionServiceImpl questionService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private UUID quizId;
    private UUID questionId;
    private String username;
    private Set<String> authorities;

    @BeforeEach
    void setUp() {
        quizId = UUID.randomUUID();
        questionId = UUID.randomUUID();
        username = "lecturer1";
        authorities = Set.of(RoleEnum.LECTURER.name());
        redisUtilsMock = mockStatic(RedisUtils.class);
    }

    @AfterEach
    void tearDown() {
        redisUtilsMock.close();
    }

    @Test
    @DisplayName("addQuestion - when question type config missing, should throw BadRequestException")
    void addQuestion_MissingTypeConfig_ThrowsBadRequestException() {
        QuizQuestionRequest request = new QuizQuestionRequest();
        request.setQuestionType(QuestionType.SINGLE_CHOICE);
        request.setContent("What is Java?");

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(typeConfigRepo.findByQuizIdAndQuestionType(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(Optional.empty());

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> questionService.addQuestion(quizId, request, username, authorities));

        assertEquals("Question type configuration for SINGLE_CHOICE must be created before adding questions.",
                ex.getMessage());
    }

    @Test
    @DisplayName("addQuestion - when question limit reached, should throw BadRequestException")
    void addQuestion_ReachesCountLimit_ThrowsBadRequestException() {
        QuizQuestionRequest request = new QuizQuestionRequest();
        request.setQuestionType(QuestionType.SINGLE_CHOICE);
        request.setContent("What is Java?");

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(quizId)
                .questionType(QuestionType.SINGLE_CHOICE)
                .requiredCount(2)
                .build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(typeConfigRepo.findByQuizIdAndQuestionType(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(Optional.of(config));
        when(questionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(2);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> questionService.addQuestion(quizId, request, username, authorities));

        assertEquals("Cannot add question. Total questions for type SINGLE_CHOICE reaches the required limit of 2",
                ex.getMessage());
    }

    @Test
    @DisplayName("addQuestion - when ESSAY question has options, should throw BadRequestException")
    void addQuestion_EssayWithOptions_ThrowsBadRequestException() {
        QuizQuestionOptionRequest opt = new QuizQuestionOptionRequest();
        opt.setOptionText("Option A");
        opt.setIsCorrect(true);

        QuizQuestionRequest request = new QuizQuestionRequest();
        request.setQuestionType(QuestionType.ESSAY);
        request.setContent("Explain OOP");
        request.setOptions(List.of(opt));

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(quizId)
                .questionType(QuestionType.ESSAY)
                .requiredCount(5)
                .build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(typeConfigRepo.findByQuizIdAndQuestionType(quizId, QuestionType.ESSAY)).thenReturn(Optional.of(config));
        when(questionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.ESSAY)).thenReturn(0);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> questionService.addQuestion(quizId, request, username, authorities));

        assertEquals("ESSAY question must not have options.", ex.getMessage());
    }

    @Test
    @DisplayName("addQuestion - when SINGLE_CHOICE correct options != 1, should throw BadRequestException")
    void addQuestion_SingleChoiceInvalidCorrectCount_ThrowsBadRequestException() {
        QuizQuestionOptionRequest opt1 = new QuizQuestionOptionRequest();
        opt1.setOptionText("Option A");
        opt1.setIsCorrect(true);

        QuizQuestionOptionRequest opt2 = new QuizQuestionOptionRequest();
        opt2.setOptionText("Option B");
        opt2.setIsCorrect(true);

        QuizQuestionRequest request = new QuizQuestionRequest();
        request.setQuestionType(QuestionType.SINGLE_CHOICE);
        request.setContent("Select 1 option");
        request.setOptions(List.of(opt1, opt2));

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(quizId)
                .questionType(QuestionType.SINGLE_CHOICE)
                .requiredCount(5)
                .build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(typeConfigRepo.findByQuizIdAndQuestionType(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(Optional.of(config));
        when(questionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(0);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> questionService.addQuestion(quizId, request, username, authorities));

        assertEquals("SINGLE_CHOICE question must have EXACTLY 1 correct option. Found: 2", ex.getMessage());
    }

    @Test
    @DisplayName("addQuestion - when MULTIPLE_CHOICE correct options < 2, should throw BadRequestException")
    void addQuestion_MultipleChoiceInvalidCorrectCount_ThrowsBadRequestException() {
        QuizQuestionOptionRequest opt1 = new QuizQuestionOptionRequest();
        opt1.setOptionText("Option A");
        opt1.setIsCorrect(true);

        QuizQuestionOptionRequest opt2 = new QuizQuestionOptionRequest();
        opt2.setOptionText("Option B");
        opt2.setIsCorrect(false);

        QuizQuestionRequest request = new QuizQuestionRequest();
        request.setQuestionType(QuestionType.MULTIPLE_CHOICE);
        request.setContent("Select multiple options");
        request.setOptions(List.of(opt1, opt2));

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(quizId)
                .questionType(QuestionType.MULTIPLE_CHOICE)
                .requiredCount(5)
                .build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(typeConfigRepo.findByQuizIdAndQuestionType(quizId, QuestionType.MULTIPLE_CHOICE))
                .thenReturn(Optional.of(config));
        when(questionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.MULTIPLE_CHOICE))
                .thenReturn(0);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> questionService.addQuestion(quizId, request, username, authorities));

        assertEquals("MULTIPLE_CHOICE question must have AT LEAST 2 correct options. Found: 1", ex.getMessage());
    }

    @Test
    @DisplayName("addQuestion - should save question, options, and reset quiz status to DRAFT")
    void addQuestion_Success_ResetsQuizToDraft() {
        QuizQuestionOptionRequest opt1 = new QuizQuestionOptionRequest();
        opt1.setOptionText("Option A");
        opt1.setIsCorrect(true);

        QuizQuestionOptionRequest opt2 = new QuizQuestionOptionRequest();
        opt2.setOptionText("Option B");
        opt2.setIsCorrect(false);

        QuizQuestionRequest request = new QuizQuestionRequest();
        request.setQuestionType(QuestionType.SINGLE_CHOICE);
        request.setContent("What is Java?");
        request.setOptions(List.of(opt1, opt2));

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.REJECTED).build();
        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(quizId)
                .questionType(QuestionType.SINGLE_CHOICE)
                .requiredCount(5)
                .pointsPerQuestion(new BigDecimal("2.00"))
                .build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(typeConfigRepo.findByQuizIdAndQuestionType(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(Optional.of(config));
        when(questionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(0);
        when(optionRepo.save(any(QuizQuestionOptionEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        QuizQuestionResponse response = questionService.addQuestion(quizId, request, username, authorities);

        assertNotNull(response);
        assertEquals(QuizStatus.DRAFT, quiz.getStatus());
        verify(quizRepo).save(quiz);
        verify(questionRepo).save(any(QuizQuestionEntity.class));
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()), org.mockito.Mockito.atLeastOnce());
    }

    @Test
    @DisplayName("updateQuestion - when question not found, should throw DataNotFoundException")
    void updateQuestion_QuestionNotFound_ThrowsDataNotFoundException() {
        QuizQuestionRequest request = new QuizQuestionRequest();
        request.setQuestionType(QuestionType.ESSAY);
        request.setContent("Updated content");

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(questionRepo.findByIdAndDeletedAtIsNull(questionId)).thenReturn(Optional.empty());

        assertThrows(DataNotFoundException.class,
                () -> questionService.updateQuestion(quizId, questionId, request, username, authorities));
    }

    @Test
    @DisplayName("updateQuestion - when question does not belong to quiz, should throw BadRequestException")
    void updateQuestion_QuestionDoesNotBelongToQuiz_ThrowsBadRequestException() {
        QuizQuestionRequest request = new QuizQuestionRequest();
        request.setQuestionType(QuestionType.ESSAY);
        request.setContent("Updated content");

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        QuizQuestionEntity question = QuizQuestionEntity.builder().id(questionId).quizId(UUID.randomUUID()).build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(questionRepo.findByIdAndDeletedAtIsNull(questionId)).thenReturn(Optional.of(question));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> questionService.updateQuestion(quizId, questionId, request, username, authorities));

        assertEquals("Question does not belong to the specified quiz", ex.getMessage());
    }

    @Test
    @DisplayName("updateQuestion - should update question content, order, and replace options")
    void updateQuestion_Success() {
        QuizQuestionRequest request = new QuizQuestionRequest();
        request.setQuestionType(QuestionType.ESSAY);
        request.setContent("Updated essay prompt");
        request.setOrderIndex(2);

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        QuizQuestionEntity question = QuizQuestionEntity.builder().id(questionId).quizId(quizId).content("Old content")
                .build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(questionRepo.findByIdAndDeletedAtIsNull(questionId)).thenReturn(Optional.of(question));

        QuizQuestionResponse response = questionService.updateQuestion(quizId, questionId, request, username,
                authorities);

        assertNotNull(response);
        assertEquals("Updated essay prompt", question.getContent());
        assertEquals(2, question.getOrderIndex());
        verify(questionRepo).save(question);
        verify(optionRepo).deleteByQuestionId(questionId);
    }

    @Test
    @DisplayName("deleteQuestion - should soft delete question")
    void deleteQuestion_Success() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        QuizQuestionEntity question = QuizQuestionEntity.builder().id(questionId).quizId(quizId).build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(questionRepo.findByIdAndDeletedAtIsNull(questionId)).thenReturn(Optional.of(question));

        questionService.deleteQuestion(quizId, questionId, username, authorities);

        assertNotNull(question.getDeletedAt());
        assertEquals(username, question.getDeletedBy());
        verify(questionRepo).save(question);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()), org.mockito.Mockito.atLeastOnce());
    }
}
