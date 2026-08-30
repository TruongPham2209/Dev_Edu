package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.dto.enums.ScoringMethod;
import com.pht.dev_edu.quiz.dto.request.QuizRequest;
import com.pht.dev_edu.quiz.dto.request.QuizReviewRequest;
import com.pht.dev_edu.quiz.dto.request.QuizTypeConfigRequest;
import com.pht.dev_edu.quiz.dto.response.*;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionTypeConfigEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.*;
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

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/*
 * <analysis>
 * QuizManagementServiceImpl
 * - createQuiz(QuizRequest request, String username, Set<String> authorities)
 *   - branches:
 *       validates course access and saves quiz in DRAFT status
 *   - paths:
 *       [P1: create quiz in DRAFT status]
 *   - planned tests:
 *       [createQuiz_Success -> P1]
 *
 * - updateQuiz(UUID quizId, QuizRequest request, String username, Set<String> authorities)
 *   - branches:
 *       quiz.status == PENDING -> BadRequestException
 *       quiz.status == APPROVED && hasAssignments -> BadRequestException
 *       quiz.status == REJECTED -> status reset to DRAFT
 *       success -> update title/desc and invalidate cache
 *   - paths:
 *       [P1: quiz pending]
 *       [P2: approved quiz has active assignments]
 *       [P3: rejected quiz updated to draft]
 *   - planned tests:
 *       [updateQuiz_WhenQuizPending_ThrowsBadRequestException -> P1]
 *       [updateQuiz_WhenApprovedAndHasAssignments_ThrowsBadRequestException -> P2]
 *       [updateQuiz_WhenRejected_ResetsStatusToDraftAndUpdates -> P3]
 *
 * - configureTypeConfig(UUID quizId, QuizTypeConfigRequest request, String username, Set<String> authorities)
 *   - branches:
 *       questions of type exist -> BadRequestException
 *       ESSAY && scoringMethod != MANUAL -> BadRequestException
 *       !ESSAY && scoringMethod != AUTO -> BadRequestException
 *       success -> save type config
 *   - paths:
 *       [P1: questions exist]
 *       [P2: essay without manual scoring]
 *       [P3: choice without auto scoring]
 *       [P4: successful configuration]
 *   - planned tests:
 *       [configureTypeConfig_WhenQuestionsAlreadyExist_ThrowsBadRequestException -> P1]
 *       [configureTypeConfig_EssayWithoutManualScoring_ThrowsBadRequestException -> P2]
 *       [configureTypeConfig_NonEssayWithoutAutoScoring_ThrowsBadRequestException -> P3]
 *       [configureTypeConfig_Success -> P4]
 *
 * - submitQuizForApproval(UUID quizId, String username, Set<String> authorities)
 *   - branches:
 *       !createdBy.equals(username) -> BadRequestException
 *       status != DRAFT && status != REJECTED -> BadRequestException
 *       actualCount != requiredCount -> BadRequestException
 *       success -> status = PENDING
 *   - paths:
 *       [P1: not owner]
 *       [P2: invalid status]
 *       [P3: question count mismatch]
 *       [P4: successful submission]
 *   - planned tests:
 *       [submitQuizForApproval_NotCreatedByOwner_ThrowsBadRequestException -> P1]
 *       [submitQuizForApproval_NotDraftOrRejected_ThrowsBadRequestException -> P2]
 *       [submitQuizForApproval_QuestionCountMismatch_ThrowsBadRequestException -> P3]
 *       [submitQuizForApproval_Success -> P4]
 *
 * - reviewQuiz(UUID quizId, QuizReviewRequest request, String username)
 *   - branches:
 *       approved == true -> APPROVED
 *       approved == false && rejectionReason blank -> BadRequestException
 *       approved == false -> REJECTED
 *   - paths:
 *       [P1: approve quiz]
 *       [P2: reject quiz without reason]
 *       [P3: reject quiz with reason]
 *   - planned tests:
 *       [reviewQuiz_Approve_Success -> P1]
 *       [reviewQuiz_RejectWithoutReason_ThrowsBadRequestException -> P2]
 *       [reviewQuiz_RejectWithReason_Success -> P3]
 *
 * - getQuizDetail(UUID quizId, String username, Set<String> authorities)
 *   - branches:
 *       validates access and returns cache/db quiz detail
 *   - paths:
 *       [P1: return quiz detail]
 *   - planned tests:
 *       [getQuizDetail_DelegatesToQuizService -> P1]
 *
 * - getQuizzesByCourse(UUID courseId, QuizStatus status, String nextCursor, String username, Set<String> authorities)
 *   - branches:
 *       validates course access and fetches paged quizzes
 *   - paths:
 *       [P1: return paged course quizzes]
 *   - planned tests:
 *       [getQuizzesByCourse_ReturnsPagedQuizzes -> P1]
 *
 * - getQuizzes(QuizStatus status, String nextCursor)
 *   - branches:
 *       fetches paged quizzes by status
 *   - paths:
 *       [P1: return paged quizzes]
 *   - planned tests:
 *       [getQuizzes_ReturnsPagedQuizzes -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizManagementServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify Quiz CRUD operations, question type configuration rules, approval
 * workflow, and review logic.
 *
 * Test Scope
 * ----------
 * - createQuiz(QuizRequest, String, Set<String>)
 * - updateQuiz(UUID, QuizRequest, String, Set<String>)
 * - configureTypeConfig(UUID, QuizTypeConfigRequest, String, Set<String>)
 * - submitQuizForApproval(UUID, String, Set<String>)
 * - reviewQuiz(UUID, QuizReviewRequest, String)
 * - getQuizDetail(UUID, String, Set<String>)
 * - getQuizzesByCourse(UUID, QuizStatus, String, String, Set<String>)
 * - getQuizzes(QuizStatus, String)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Quiz creation in DRAFT status
 * ✓ Edit restrictions when PENDING or APPROVED with active assignments
 * ✓ Auto transition from REJECTED back to DRAFT upon modification
 * ✓ Scoring method constraints (ESSAY = MANUAL, choices = AUTO)
 * ✓ Submission for approval checks (ownership, valid status, required question
 * count match)
 * ✓ Admin review approval (APPROVED) and rejection validation (rejectionReason
 * required)
 * ✓ Detail retrieval and cursor pagination for course/all quizzes
 *
 * Mocked Dependencies
 * -------------------
 * - QuizRepo
 * - QuizQuestionTypeConfigRepo
 * - QuizQuestionRepo
 * - QuizAssignmentRepo
 * - QuizMapper (Spy)
 * - QuizService
 * - QuizAuditService
 * - QuizAccessService
 * - RedisUtils (static mock)
 */
@ExtendWith(MockitoExtension.class)
class QuizManagementServiceImplTest {

    @Mock
    QuizRepo quizRepo;
    @Mock
    QuizQuestionTypeConfigRepo typeConfigRepo;
    @Mock
    QuizQuestionRepo questionRepo;
    @Mock
    QuizQuestionOptionRepo optionRepo;
    @Mock
    QuizAssignmentRepo assignmentRepo;
    @Spy
    private QuizMapper quizMapper = Mappers.getMapper(QuizMapper.class);
    @Mock
    QuizService quizService;
    @Mock
    QuizAuditService auditService;
    @Mock
    QuizAccessService quizAccessService;

    @InjectMocks
    QuizManagementServiceImpl quizManagementService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private UUID quizId;
    private UUID courseId;
    private String username;
    private Set<String> authorities;

    @BeforeEach
    void setUp() {
        quizId = UUID.randomUUID();
        courseId = UUID.randomUUID();
        username = "lecturer1";
        authorities = Set.of(RoleEnum.LECTURER.name());
        redisUtilsMock = mockStatic(RedisUtils.class);
    }

    @AfterEach
    void tearDown() {
        redisUtilsMock.close();
    }

    @Test
    @DisplayName("createQuiz - should save quiz in DRAFT status and log audit")
    void createQuiz_Success() {
        QuizRequest request = new QuizRequest();
        request.setCourseId(courseId);
        request.setTitle("Java Fundamentals");
        request.setDescription("Basic Java Quiz");

        QuizResponse response = quizManagementService.createQuiz(request, username, authorities);

        assertNotNull(response);
        assertEquals(QuizStatus.DRAFT, response.getStatus());
        verify(quizAccessService).validateAccessByCourse(username, authorities, courseId);
        verify(quizRepo).save(any(QuizEntity.class));
        verify(auditService).log(eq("QUIZ"), any(), eq(QuizAuditAction.CREATE_QUIZ), eq(username), any(), any(), any());
    }

    @Test
    @DisplayName("updateQuiz - when quiz is PENDING, should throw BadRequestException")
    void updateQuiz_WhenQuizPending_ThrowsBadRequestException() {
        QuizRequest request = new QuizRequest();
        request.setTitle("Updated Title");

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.PENDING).build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> quizManagementService.updateQuiz(quizId, request, username, authorities));

        assertEquals("Quiz is pending approval and cannot be edited.", ex.getMessage());
    }

    @Test
    @DisplayName("updateQuiz - when approved quiz has active assignments, should throw BadRequestException")
    void updateQuiz_WhenApprovedAndHasAssignments_ThrowsBadRequestException() {
        QuizRequest request = new QuizRequest();
        request.setTitle("Updated Title");

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.APPROVED).build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(assignmentRepo.existsByQuizIdAndDeletedAtIsNull(quizId)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> quizManagementService.updateQuiz(quizId, request, username, authorities));

        assertEquals("Cannot edit quiz structure because active assignments already exist for this approved quiz.",
                ex.getMessage());
    }

    @Test
    @DisplayName("updateQuiz - when quiz is REJECTED, should reset status to DRAFT and update title/description")
    void updateQuiz_WhenRejected_ResetsStatusToDraftAndUpdates() {
        QuizRequest request = new QuizRequest();
        request.setTitle("New Title");
        request.setDescription("New Desc");

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.REJECTED).build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        QuizResponse response = quizManagementService.updateQuiz(quizId, request, username, authorities);

        assertNotNull(response);
        assertEquals(QuizStatus.DRAFT, quiz.getStatus());
        assertEquals("New Title", quiz.getTitle());
        verify(quizRepo).save(quiz);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()), org.mockito.Mockito.atLeastOnce());
    }

    @Test
    @DisplayName("configureTypeConfig - when questions of type already exist, should throw BadRequestException")
    void configureTypeConfig_WhenQuestionsAlreadyExist_ThrowsBadRequestException() {
        QuizTypeConfigRequest request = new QuizTypeConfigRequest();
        request.setQuestionType(QuestionType.SINGLE_CHOICE);
        request.setScoringMethod(ScoringMethod.AUTO);

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(questionRepo.existsByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> quizManagementService.configureTypeConfig(quizId, request, username, authorities));

        assertEquals(
                "Cannot change question type configuration after questions of type SINGLE_CHOICE have already been created.",
                ex.getMessage());
    }

    @Test
    @DisplayName("configureTypeConfig - when ESSAY question type has non-MANUAL scoring, should throw BadRequestException")
    void configureTypeConfig_EssayWithoutManualScoring_ThrowsBadRequestException() {
        QuizTypeConfigRequest request = new QuizTypeConfigRequest();
        request.setQuestionType(QuestionType.ESSAY);
        request.setScoringMethod(ScoringMethod.AUTO);

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(questionRepo.existsByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.ESSAY))
                .thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> quizManagementService.configureTypeConfig(quizId, request, username, authorities));

        assertEquals("ESSAY question type must have scoring_method = MANUAL", ex.getMessage());
    }

    @Test
    @DisplayName("configureTypeConfig - when choice question type has non-AUTO scoring, should throw BadRequestException")
    void configureTypeConfig_NonEssayWithoutAutoScoring_ThrowsBadRequestException() {
        QuizTypeConfigRequest request = new QuizTypeConfigRequest();
        request.setQuestionType(QuestionType.SINGLE_CHOICE);
        request.setScoringMethod(ScoringMethod.MANUAL);

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(questionRepo.existsByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> quizManagementService.configureTypeConfig(quizId, request, username, authorities));

        assertEquals("SINGLE_CHOICE and MULTIPLE_CHOICE question types must have scoring_method = AUTO",
                ex.getMessage());
    }

    @Test
    @DisplayName("configureTypeConfig - should successfully configure question type")
    void configureTypeConfig_Success() {
        QuizTypeConfigRequest request = new QuizTypeConfigRequest();
        request.setQuestionType(QuestionType.SINGLE_CHOICE);
        request.setScoringMethod(ScoringMethod.AUTO);
        request.setRequiredCount(5);
        request.setPointsPerQuestion(new BigDecimal("2.00"));

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(questionRepo.existsByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(false);
        when(typeConfigRepo.findByQuizIdAndQuestionType(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(Optional.empty());

        QuizTypeConfigResponse response = quizManagementService.configureTypeConfig(quizId, request, username,
                authorities);

        assertNotNull(response);
        assertEquals(5, response.getRequiredCount());
        verify(typeConfigRepo).save(any(QuizQuestionTypeConfigEntity.class));
    }

    @Test
    @DisplayName("submitQuizForApproval - when not submitted by creator, should throw BadRequestException")
    void submitQuizForApproval_NotCreatedByOwner_ThrowsBadRequestException() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).createdBy("otherUser").build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> quizManagementService.submitQuizForApproval(quizId, username, authorities));

        assertEquals("You can only submit your own quizzes for approval.", ex.getMessage());
    }

    @Test
    @DisplayName("submitQuizForApproval - when status is not DRAFT or REJECTED, should throw BadRequestException")
    void submitQuizForApproval_NotDraftOrRejected_ThrowsBadRequestException() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.APPROVED).createdBy(username).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> quizManagementService.submitQuizForApproval(quizId, username, authorities));

        assertEquals("Only quizzes in DRAFT or REJECTED status can be submitted for approval.", ex.getMessage());
    }

    @Test
    @DisplayName("submitQuizForApproval - when question count does not match config, should throw BadRequestException")
    void submitQuizForApproval_QuestionCountMismatch_ThrowsBadRequestException() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).createdBy(username).build();
        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(quizId)
                .questionType(QuestionType.SINGLE_CHOICE)
                .requiredCount(5)
                .build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(typeConfigRepo.findByQuizId(quizId)).thenReturn(List.of(config));
        when(questionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(3);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> quizManagementService.submitQuizForApproval(quizId, username, authorities));

        assertEquals("Question count mismatch for type SINGLE_CHOICE. Required: 5, Actual: 3", ex.getMessage());
    }

    @Test
    @DisplayName("submitQuizForApproval - should transition quiz status to PENDING")
    void submitQuizForApproval_Success() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).createdBy(username).build();
        QuizQuestionTypeConfigEntity config = QuizQuestionTypeConfigEntity.builder()
                .quizId(quizId)
                .questionType(QuestionType.SINGLE_CHOICE)
                .requiredCount(5)
                .build();

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(typeConfigRepo.findByQuizId(quizId)).thenReturn(List.of(config));
        when(questionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, QuestionType.SINGLE_CHOICE))
                .thenReturn(5);

        QuizResponse response = quizManagementService.submitQuizForApproval(quizId, username, authorities);

        assertNotNull(response);
        assertEquals(QuizStatus.PENDING, quiz.getStatus());
        assertEquals(username, quiz.getSubmittedBy());
        verify(quizRepo).save(quiz);
        verify(auditService).log(eq("QUIZ"), eq(quizId), eq(QuizAuditAction.SUBMIT_FOR_APPROVAL), eq(username), any(),
                any(), any());
    }

    @Test
    @DisplayName("reviewQuiz - when approved is true, should set quiz status to APPROVED")
    void reviewQuiz_Approve_Success() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.PENDING).build();
        QuizReviewRequest request = new QuizReviewRequest();
        request.setApproved(true);

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        QuizResponse response = quizManagementService.reviewQuiz(quizId, request, "adminUser");

        assertNotNull(response);
        assertEquals(QuizStatus.APPROVED, quiz.getStatus());
        assertEquals("adminUser", quiz.getApprovedBy());
        verify(quizRepo).save(quiz);
        verify(auditService).log(eq("QUIZ"), eq(quizId), eq(QuizAuditAction.APPROVE), eq("adminUser"), any(), any(),
                any());
    }

    @Test
    @DisplayName("reviewQuiz - when rejecting without reason, should throw BadRequestException")
    void reviewQuiz_RejectWithoutReason_ThrowsBadRequestException() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.PENDING).build();
        QuizReviewRequest request = new QuizReviewRequest();
        request.setApproved(false);
        request.setRejectionReason("");

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> quizManagementService.reviewQuiz(quizId, request, "adminUser"));

        assertEquals("Rejection reason is required when rejecting a quiz.", ex.getMessage());
    }

    @Test
    @DisplayName("reviewQuiz - when rejecting with reason, should set quiz status to REJECTED")
    void reviewQuiz_RejectWithReason_Success() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.PENDING).build();
        QuizReviewRequest request = new QuizReviewRequest();
        request.setApproved(false);
        request.setRejectionReason("Not enough options");

        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        QuizResponse response = quizManagementService.reviewQuiz(quizId, request, "adminUser");

        assertNotNull(response);
        assertEquals(QuizStatus.REJECTED, quiz.getStatus());
        assertEquals("Not enough options", quiz.getRejectionReason());
        verify(auditService).log(eq("QUIZ"), eq(quizId), eq(QuizAuditAction.REJECT), eq("adminUser"), any(), any(),
                any());
    }

    @Test
    @DisplayName("getQuizDetail - should delegate detail lookup to QuizService")
    void getQuizDetail_DelegatesToQuizService() {
        QuizDetailResponse detailResponse = QuizDetailResponse.builder().build();
        when(quizService.getQuizDetailResponseFromCache(quizId)).thenReturn(detailResponse);

        QuizDetailResponse response = quizManagementService.getQuizDetail(quizId, username, authorities);

        assertNotNull(response);
        verify(quizAccessService).validateAccessByQuiz(username, authorities, quizId);
    }

    @Test
    @DisplayName("getQuizzesByCourse - should return paged quiz list for specified course")
    void getQuizzesByCourse_ReturnsPagedQuizzes() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).title("Quiz 1").build();
        when(quizRepo.findByCourseIdAndDeletedAtIsNull(eq(courseId), eq("APPROVED"), eq(""), any(), any(), eq(11)))
                .thenReturn(List.of(quiz));

        CustomPaging<QuizResponse> result = quizManagementService.getQuizzesByCourse(courseId, "", QuizStatus.APPROVED,
                null, username, authorities);

        assertNotNull(result);
        assertEquals(1, result.getContents().size());
        verify(quizAccessService).validateAccessByCourse(username, authorities, courseId);
    }

    @Test
    @DisplayName("getQuizzesByCourse - should pass keyword to repository when keyword is provided")
    void getQuizzesByCourse_WithKeyword_ReturnsFilteredQuizzes() {
        String keyword = "java";
        QuizEntity quiz = QuizEntity.builder().id(quizId).title("Java Basics").build();
        when(quizRepo.findByCourseIdAndDeletedAtIsNull(eq(courseId), eq("APPROVED"), eq(keyword), any(), any(), eq(11)))
                .thenReturn(List.of(quiz));

        CustomPaging<QuizResponse> result = quizManagementService.getQuizzesByCourse(courseId, keyword,
                QuizStatus.APPROVED,
                null, username, authorities);

        assertNotNull(result);
        assertEquals(1, result.getContents().size());
        assertEquals("Java Basics", result.getContents().iterator().next().getTitle());
        verify(quizRepo).findByCourseIdAndDeletedAtIsNull(eq(courseId), eq("APPROVED"), eq(keyword), any(), any(),
                eq(11));
    }

    @Test
    @DisplayName("getQuizzesByCourse - should support Vietnamese keyword search")
    void getQuizzesByCourse_WithVietnameseKeyword_ReturnsFilteredQuizzes() {
        String keyword = "Kiểm tra Java";
        QuizEntity quiz = QuizEntity.builder().id(quizId).title("Bài kiểm tra Java").build();
        when(quizRepo.findByCourseIdAndDeletedAtIsNull(eq(courseId), eq("APPROVED"), eq(keyword), any(), any(), eq(11)))
                .thenReturn(List.of(quiz));

        CustomPaging<QuizResponse> result = quizManagementService.getQuizzesByCourse(courseId, keyword,
                QuizStatus.APPROVED,
                null, username, authorities);

        assertNotNull(result);
        assertEquals(1, result.getContents().size());
        assertEquals("Bài kiểm tra Java", result.getContents().iterator().next().getTitle());
        verify(quizRepo).findByCourseIdAndDeletedAtIsNull(eq(courseId), eq("APPROVED"), eq(keyword), any(), any(),
                eq(11));
    }

    @Test
    @DisplayName("getQuizzesByCourse - should handle null status gracefully")
    void getQuizzesByCourse_WithNullStatus_PassesNullStatusToRepo() {
        String keyword = "test";
        QuizEntity quiz = QuizEntity.builder().id(quizId).title("Test Quiz").build();
        when(quizRepo.findByCourseIdAndDeletedAtIsNull(eq(courseId), isNull(), eq(keyword), any(), any(), eq(11)))
                .thenReturn(List.of(quiz));

        CustomPaging<QuizResponse> result = quizManagementService.getQuizzesByCourse(courseId, keyword, null,
                null, username, authorities);

        assertNotNull(result);
        assertEquals(1, result.getContents().size());
        verify(quizRepo).findByCourseIdAndDeletedAtIsNull(eq(courseId), isNull(), eq(keyword), any(), any(), eq(11));
    }

    @Test
    @DisplayName("getQuizzes - should return paged quiz list by status")
    void getQuizzes_ReturnsPagedQuizzes() {
        QuizEntity quiz = QuizEntity.builder().id(quizId).title("Quiz 1").build();
        when(quizRepo.findByStatusAndDeletedAtIsNull(eq("APPROVED"), eq(""), any(), any(), eq(11)))
                .thenReturn(List.of(quiz));

        CustomPaging<QuizResponse> result = quizManagementService.getQuizzes(QuizStatus.APPROVED, "", null);

        assertNotNull(result);
        assertEquals(1, result.getContents().size());
    }

    @Test
    @DisplayName("getQuizzes - should pass keyword to repository when keyword is provided")
    void getQuizzes_WithKeyword_ReturnsFilteredQuizzes() {
        String keyword = "spring";
        QuizEntity quiz = QuizEntity.builder().id(quizId).title("Spring Boot Advanced").build();
        when(quizRepo.findByStatusAndDeletedAtIsNull(eq("APPROVED"), eq(keyword), any(), any(), eq(11)))
                .thenReturn(List.of(quiz));

        CustomPaging<QuizResponse> result = quizManagementService.getQuizzes(QuizStatus.APPROVED, keyword, null);

        assertNotNull(result);
        assertEquals(1, result.getContents().size());
        assertEquals("Spring Boot Advanced", result.getContents().iterator().next().getTitle());
        verify(quizRepo).findByStatusAndDeletedAtIsNull(eq("APPROVED"), eq(keyword), any(), any(), eq(11));
    }

    @Test
    @DisplayName("getQuizzes - should support Vietnamese keyword search")
    void getQuizzes_WithVietnameseKeyword_ReturnsFilteredQuizzes() {
        String keyword = "Lập trình";
        QuizEntity quiz = QuizEntity.builder().id(quizId).title("Lập trình Java Web").build();
        when(quizRepo.findByStatusAndDeletedAtIsNull(eq("APPROVED"), eq(keyword), any(), any(), eq(11)))
                .thenReturn(List.of(quiz));

        CustomPaging<QuizResponse> result = quizManagementService.getQuizzes(QuizStatus.APPROVED, keyword, null);

        assertNotNull(result);
        assertEquals(1, result.getContents().size());
        assertEquals("Lập trình Java Web", result.getContents().iterator().next().getTitle());
        verify(quizRepo).findByStatusAndDeletedAtIsNull(eq("APPROVED"), eq(keyword), any(), any(), eq(11));
    }

    @Test
    @DisplayName("duplicateQuiz - should duplicate quiz, type configs, questions, and options successfully")
    void duplicateQuiz_Success() {
        QuizResponse existingQuizResponse = QuizResponse.builder()
                .id(quizId)
                .title("Original Quiz")
                .courseId(courseId)
                .description("Original Description")
                .build();
        QuizTypeConfigResponse typeConfigResponse = QuizTypeConfigResponse.builder()
                .questionType(QuestionType.SINGLE_CHOICE)
                .requiredCount(5)
                .pointsPerQuestion(BigDecimal.valueOf(2.0))
                .scoringMethod(ScoringMethod.AUTO)
                .build();
        QuizQuestionOptionResponse optionResponse = QuizQuestionOptionResponse.builder()
                .optionText("Option A")
                .isCorrect(true)
                .orderIndex(1)
                .build();
        QuizQuestionResponse questionResponse = QuizQuestionResponse.builder()
                .id(UUID.randomUUID())
                .questionType(QuestionType.SINGLE_CHOICE)
                .content("Question 1")
                .points(BigDecimal.valueOf(2.0))
                .orderIndex(1)
                .options(List.of(optionResponse))
                .build();

        QuizDetailResponse detailResponse = QuizDetailResponse.builder()
                .quiz(existingQuizResponse)
                .typeConfigs(List.of(typeConfigResponse))
                .questions(List.of(questionResponse))
                .build();

        when(quizService.getQuizDetailResponseFromCache(quizId)).thenReturn(detailResponse);

        QuizResponse response = quizManagementService.duplicateQuiz(quizId, username, authorities);

        assertNotNull(response);
        assertEquals(QuizStatus.DRAFT, response.getStatus());
        assertEquals("Original Quiz", response.getTitle());
        verify(quizAccessService).validateAccessByQuiz(username, authorities, quizId);
        verify(quizRepo).save(any(QuizEntity.class));
        verify(typeConfigRepo).saveAll(any());
        verify(questionRepo).save(any());
        verify(optionRepo).saveAll(any());
        verify(auditService).log(eq("QUIZ"), any(), eq(QuizAuditAction.CREATE_QUIZ), eq(username), any(), any(), any());
    }
}
