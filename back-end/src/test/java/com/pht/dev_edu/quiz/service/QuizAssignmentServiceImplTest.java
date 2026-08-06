package com.pht.dev_edu.quiz.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.quiz.dto.enums.AssignmentStatus;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.dto.request.CreateAssignmentRequest;
import com.pht.dev_edu.quiz.dto.response.QuizAssignmentResponse;
import com.pht.dev_edu.quiz.entity.QuizAssignmentEntity;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.QuizAssignmentRepo;
import com.pht.dev_edu.quiz.repo.QuizAttemptRepo;

/*
 * <analysis>
 * QuizAssignmentServiceImpl
 * - createAssignment(CreateAssignmentRequest request, String username, Set<String> authorities)
 *   - branches:
 *       quiz.status != APPROVED -> BadRequestException
 *       endTime != null && endTime < startTime -> BadRequestException
 *       existsOverlappingAssignment -> BadRequestException
 *       startTime > now -> SCHEDULED
 *       startTime <= now -> ACTIVE
 *   - paths:
 *       [P1: quiz not approved]
 *       [P2: end time before start time]
 *       [P3: overlapping assignment]
 *       [P4: create scheduled assignment]
 *       [P5: create active assignment]
 *   - planned tests:
 *       [createAssignment_QuizNotApproved_ThrowsBadRequestException -> P1]
 *       [createAssignment_EndTimeBeforeStartTime_ThrowsBadRequestException -> P2]
 *       [createAssignment_OverlappingTime_ThrowsBadRequestException -> P3]
 *       [createAssignment_ScheduledStatus_Success -> P4]
 *       [createAssignment_ActiveStatus_Success -> P5]
 *
 * - deleteAssignment(UUID assignmentId, String username, Set<String> authorities)
 *   - branches:
 *       deletedAt != null -> DataNotFoundException
 *       existsByAssignmentId -> BadRequestException
 *       success -> set deletedAt, save, invalidate cache
 *   - paths:
 *       [P1: already deleted]
 *       [P2: attempts exist]
 *       [P3: successful deletion]
 *   - planned tests:
 *       [deleteAssignment_WhenAlreadyDeleted_ThrowsDataNotFoundException -> P1]
 *       [deleteAssignment_WhenAttemptsExist_ThrowsBadRequestException -> P2]
 *       [deleteAssignment_Success -> P3]
 *
 * - getAssignmentsByQuiz(UUID quizId, String username, Set<String> authorities)
 *   - branches:
 *       validates access and returns list
 *   - paths:
 *       [P1: return response list]
 *   - planned tests:
 *       [getAssignmentsByQuiz_ReturnsResponseList -> P1]
 *
 * - getAssignmentById(UUID assignmentId, String username, Set<String> authorities)
 *   - branches:
 *       assignment found & active -> return response
 *   - paths:
 *       [P1: return assignment response]
 *   - planned tests:
 *       [getAssignmentById_Success -> P1]
 *
 * - getAssignmentsByCourseId(UUID courseId, String username, Set<String> authorities)
 *   - branches:
 *       validates course access and queries assignments
 *   - paths:
 *       [P1: return course assignment list]
 *   - planned tests:
 *       [getAssignmentsByCourseId_ReturnsList -> P1]
 * </analysis>
 */

/**
 * ============================================================================
 * Unit Test for QuizAssignmentServiceImpl
 * ============================================================================
 *
 * Purpose
 * -------
 * Verify creation, deletion, status computation, and querying of quiz
 * assignments.
 *
 * Test Scope
 * ----------
 * - createAssignment(CreateAssignmentRequest, String, Set<String>)
 * - deleteAssignment(UUID, String, Set<String>)
 * - getAssignmentsByQuiz(UUID, String, Set<String>)
 * - getAssignmentById(UUID, String, Set<String>)
 * - getAssignmentsByCourseId(UUID, String, Set<String>)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Quiz status validations during assignment creation (APPROVED required)
 * ✓ Time overlap and start/end time validity checks
 * ✓ Initial status determination (SCHEDULED vs ACTIVE)
 * ✓ Delete restraints when student attempts exist
 * ✓ Soft-deletion and Redis cache invalidation
 * ✓ Fetching assignment list by quiz and course
 *
 * Mocked Dependencies
 * -------------------
 * - QuizAssignmentRepo
 * - QuizAttemptRepo
 * - QuizMapper
 * - QuizService
 * - QuizAccessService
 * - QuizAuditService
 * - RedisUtils (static mock)
 */
@ExtendWith(MockitoExtension.class)
class QuizAssignmentServiceImplTest {

    @Mock
    QuizAssignmentRepo assignmentRepo;
    @Mock
    QuizAttemptRepo attemptRepo;
    @Mock
    QuizMapper quizMapper;
    @Mock
    QuizService quizService;
    @Mock
    QuizAccessService quizAccessService;
    @Mock
    QuizAuditService auditService;

    @InjectMocks
    QuizAssignmentServiceImpl assignmentService;

    private MockedStatic<RedisUtils> redisUtilsMock;
    private UUID quizId;
    private UUID assignmentId;
    private UUID courseId;
    private String username;
    private Set<String> authorities;

    @BeforeEach
    void setUp() {
        quizId = UUID.randomUUID();
        assignmentId = UUID.randomUUID();
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
    @DisplayName("createAssignment - when quiz is not APPROVED, should throw BadRequestException")
    void createAssignment_QuizNotApproved_ThrowsBadRequestException() {
        CreateAssignmentRequest request = new CreateAssignmentRequest();
        request.setQuizId(quizId);
        request.setStartTime(LocalDateTime.now().plusDays(1));
        request.setEndTime(LocalDateTime.now().plusDays(2));

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.DRAFT).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> assignmentService.createAssignment(request, username, authorities));

        assertEquals("Quiz must be APPROVED before creating an assignment.", ex.getMessage());
    }

    @Test
    @DisplayName("createAssignment - when end time is before start time, should throw BadRequestException")
    void createAssignment_EndTimeBeforeStartTime_ThrowsBadRequestException() {
        LocalDateTime now = LocalDateTime.now();
        CreateAssignmentRequest request = new CreateAssignmentRequest();
        request.setQuizId(quizId);
        request.setStartTime(now.plusDays(2));
        request.setEndTime(now.plusDays(1));

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.APPROVED).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> assignmentService.createAssignment(request, username, authorities));

        assertEquals("End time cannot be before start time.", ex.getMessage());
    }

    @Test
    @DisplayName("createAssignment - when time overlaps existing assignment, should throw BadRequestException")
    void createAssignment_OverlappingTime_ThrowsBadRequestException() {
        LocalDateTime now = LocalDateTime.now();
        CreateAssignmentRequest request = new CreateAssignmentRequest();
        request.setQuizId(quizId);
        request.setStartTime(now.plusDays(1));
        request.setEndTime(now.plusDays(2));

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.APPROVED).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(assignmentRepo.existsOverlappingAssignment(quizId, request.getStartTime(), request.getEndTime()))
                .thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> assignmentService.createAssignment(request, username, authorities));

        assertEquals("Assignment time overlaps with an existing assignment for this quiz.", ex.getMessage());
    }

    @Test
    @DisplayName("createAssignment - when start time in future, should create assignment with SCHEDULED status")
    void createAssignment_ScheduledStatus_Success() {
        LocalDateTime now = LocalDateTime.now();
        CreateAssignmentRequest request = new CreateAssignmentRequest();
        request.setQuizId(quizId);
        request.setAssignmentName("Midterm Quiz");
        request.setStartTime(now.plusDays(1));
        request.setEndTime(now.plusDays(2));
        request.setDurationMinutes(60);

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.APPROVED).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(assignmentRepo.existsOverlappingAssignment(quizId, request.getStartTime(), request.getEndTime()))
                .thenReturn(false);

        when(quizMapper.toResponse(any(QuizAssignmentEntity.class))).thenAnswer(inv -> {
            QuizAssignmentEntity entity = inv.getArgument(0);
            return QuizAssignmentResponse.builder()
                    .id(entity.getId())
                    .assignmentName(entity.getAssignmentName())
                    .status(entity.getStatus())
                    .build();
        });

        QuizAssignmentResponse response = assignmentService.createAssignment(request, username, authorities);

        assertNotNull(response);
        assertEquals(AssignmentStatus.SCHEDULED, response.getStatus());
        verify(assignmentRepo).save(any(QuizAssignmentEntity.class));
        verify(auditService).log(eq("ASSIGNMENT"), any(), eq(QuizAuditAction.CREATE_ASSIGNMENT), eq(username),
                any(), any(), any());
    }

    @Test
    @DisplayName("createAssignment - when start time is active, should create assignment with ACTIVE status")
    void createAssignment_ActiveStatus_Success() {
        LocalDateTime now = LocalDateTime.now();
        CreateAssignmentRequest request = new CreateAssignmentRequest();
        request.setQuizId(quizId);
        request.setAssignmentName("Active Quiz");
        request.setStartTime(now.minusHours(1));
        request.setEndTime(now.plusHours(1));
        request.setDurationMinutes(60);

        QuizEntity quiz = QuizEntity.builder().id(quizId).status(QuizStatus.APPROVED).build();
        when(quizService.getQuizEntityOrThrow(quizId)).thenReturn(quiz);
        when(assignmentRepo.existsOverlappingAssignment(quizId, request.getStartTime(), request.getEndTime()))
                .thenReturn(false);

        when(quizMapper.toResponse(any(QuizAssignmentEntity.class))).thenAnswer(inv -> {
            QuizAssignmentEntity entity = inv.getArgument(0);
            return QuizAssignmentResponse.builder()
                    .id(entity.getId())
                    .assignmentName(entity.getAssignmentName())
                    .status(entity.getStatus())
                    .build();
        });

        QuizAssignmentResponse response = assignmentService.createAssignment(request, username, authorities);

        assertNotNull(response);
        assertEquals(AssignmentStatus.ACTIVE, response.getStatus());
    }

    @Test
    @DisplayName("deleteAssignment - when already deleted, should throw DataNotFoundException")
    void deleteAssignment_WhenAlreadyDeleted_ThrowsDataNotFoundException() {
        QuizAssignmentEntity deletedAssignment = QuizAssignmentEntity.builder()
                .id(assignmentId)
                .quizId(quizId)
                .deletedAt(LocalDateTime.now())
                .build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(QuizAssignmentEntity.class), any(), any()))
                .thenReturn(deletedAssignment);

        assertThrows(DataNotFoundException.class,
                () -> assignmentService.deleteAssignment(assignmentId, username, authorities));
    }

    @Test
    @DisplayName("deleteAssignment - when attempts exist, should throw BadRequestException")
    void deleteAssignment_WhenAttemptsExist_ThrowsBadRequestException() {
        QuizAssignmentEntity assignment = QuizAssignmentEntity.builder()
                .id(assignmentId)
                .quizId(quizId)
                .build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(QuizAssignmentEntity.class), any(), any()))
                .thenReturn(assignment);
        when(attemptRepo.existsByAssignmentId(assignmentId)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> assignmentService.deleteAssignment(assignmentId, username, authorities));

        assertEquals("Cannot delete assignment because attempts already exist for this assignment.",
                ex.getMessage());
    }

    @Test
    @DisplayName("deleteAssignment - should soft delete assignment and invalidate cache")
    void deleteAssignment_Success() {
        QuizAssignmentEntity assignment = QuizAssignmentEntity.builder()
                .id(assignmentId)
                .quizId(quizId)
                .build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(QuizAssignmentEntity.class), any(), any()))
                .thenReturn(assignment);
        when(attemptRepo.existsByAssignmentId(assignmentId)).thenReturn(false);

        assignmentService.deleteAssignment(assignmentId, username, authorities);

        assertNotNull(assignment.getDeletedAt());
        assertEquals(username, assignment.getDeletedBy());
        verify(assignmentRepo).save(assignment);
        redisUtilsMock.verify(() -> RedisUtils.invalidateCache(anyString()));
    }

    @Test
    @DisplayName("getAssignmentsByQuiz - should return list of assignment responses")
    void getAssignmentsByQuiz_ReturnsResponseList() {
        QuizAssignmentEntity entity = QuizAssignmentEntity.builder().id(assignmentId).quizId(quizId).build();
        when(assignmentRepo.findByQuizIdAndDeletedAtIsNull(quizId)).thenReturn(List.of(entity));
        when(quizMapper.toResponse(entity))
                .thenReturn(QuizAssignmentResponse.builder().id(assignmentId).build());

        List<QuizAssignmentResponse> result = assignmentService.getAssignmentsByQuiz(quizId, username,
                authorities);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(assignmentId, result.get(0).getId());
        verify(quizAccessService).validateAccessByQuiz(username, authorities, quizId);
    }

    @Test
    @DisplayName("getAssignmentById - should return assignment response")
    void getAssignmentById_Success() {
        QuizAssignmentEntity assignment = QuizAssignmentEntity.builder()
                .id(assignmentId)
                .quizId(quizId)
                .build();

        redisUtilsMock.when(() -> RedisUtils.getOptionalDataFromCacheOrDb(
                anyString(), eq(QuizAssignmentEntity.class), any(), any()))
                .thenAnswer(inv -> {
                    Supplier<Optional<QuizAssignmentEntity>> dbCall = inv.getArgument(2);
                    return dbCall.get().orElse(null);
                });

        when(assignmentRepo.findByIdAndDeletedAtIsNull(assignmentId)).thenReturn(Optional.of(assignment));
        when(quizMapper.toResponse(assignment))
                .thenReturn(QuizAssignmentResponse.builder().id(assignmentId).build());

        QuizAssignmentResponse response = assignmentService.getAssignmentById(assignmentId, username,
                authorities);

        assertNotNull(response);
        assertEquals(assignmentId, response.getId());
        verify(quizAccessService).validateAccessByQuiz(username, authorities, quizId);
    }

    @Test
    @DisplayName("getAssignmentsByCourseId - should return course assignments")
    void getAssignmentsByCourseId_ReturnsList() {
        QuizAssignmentEntity assignment = QuizAssignmentEntity.builder().id(assignmentId).build();
        when(assignmentRepo.findByCourseIdAndDeletedAtIsNullAndStartTimeAndStatuses(any(), any(), any()))
                .thenReturn(List.of(assignment));
        when(quizMapper.toResponse(assignment))
                .thenReturn(QuizAssignmentResponse.builder().id(assignmentId).build());

        List<QuizAssignmentResponse> responses = assignmentService.getAssignmentsByCourseId(courseId, username,
                authorities);

        assertNotNull(responses);
        assertEquals(1, responses.size());
        verify(quizAccessService).validateAccessByCourse(username, authorities, courseId);
    }
}
