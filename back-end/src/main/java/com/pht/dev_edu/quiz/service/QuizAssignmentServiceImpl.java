package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.RedisPrefixConstant;
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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizAssignmentServiceImpl implements QuizAssignmentService {
    QuizAssignmentRepo assignmentRepo;
    QuizAttemptRepo attemptRepo;

    QuizMapper quizMapper;
    QuizService quizService;
    QuizAccessService quizAccessService;
    QuizAuditService auditService;

    @Override
    @Transactional
    public QuizAssignmentResponse createAssignment(CreateAssignmentRequest request, String username,
                                                   Set<String> authorities) {
        quizAccessService.validateAccessByQuiz(username, authorities, request.getQuizId());
        QuizEntity quiz = quizService.getQuizEntityOrThrow(request.getQuizId());

        if (quiz.getStatus() != QuizStatus.APPROVED) {
            throw new BadRequestException("Quiz must be APPROVED before creating an assignment.");
        }

        if (request.getEndTime() != null && request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("End time cannot be before start time.");
        }

        if (assignmentRepo.existsOverlappingAssignment(request.getQuizId(), request.getStartTime(),
                request.getEndTime())) {
            throw new BadRequestException("Assignment time overlaps with an existing assignment for this quiz.");
        }

        AssignmentStatus initialStatus = AssignmentStatus.SCHEDULED;
        LocalDateTime now = LocalDateTime.now();
        if (!request.getStartTime().isAfter(now)
                && (request.getEndTime() == null || request.getEndTime().isAfter(now))) {
            initialStatus = AssignmentStatus.ACTIVE;
        }

        QuizAssignmentEntity assignment = QuizAssignmentEntity.builder()
                .quizId(request.getQuizId())
                .assignmentName(request.getAssignmentName())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes())
                .shuffleQuestions(Boolean.TRUE.equals(request.getShuffleQuestions()))
                .shuffleOptions(Boolean.TRUE.equals(request.getShuffleOptions()))
                .maxAttempts(request.getMaxAttempts() != null ? request.getMaxAttempts() : 1)
                .status(initialStatus)
                .createdBy(username)
                .build();

        assignmentRepo.save(assignment);

        auditService.log("ASSIGNMENT", assignment.getId(), QuizAuditAction.CREATE_ASSIGNMENT, username, null,
                assignment, "Created quiz assignment");
        return quizMapper.toResponse(assignment);
    }

    @Override
    public void deleteAssignment(UUID assignmentId, String username, Set<String> authorities) {
        QuizAssignmentEntity assignment = getAssignmentEntity(assignmentId);
        if (assignment.getDeletedAt() != null) {
            throw new DataNotFoundException("Assignment not found.");
        }

        quizAccessService.validateAccessByQuiz(username, authorities, assignment.getQuizId());

        if (attemptRepo.existsByAssignmentId(assignmentId)) {
            throw new BadRequestException(
                    "Cannot delete assignment because attempts already exist for this assignment.");
        }

        assignment.setDeletedAt(LocalDateTime.now());
        assignment.setDeletedBy(username);
        assignmentRepo.save(assignment);
        invalidAssignment(assignmentId);
    }

    @Override
    public List<QuizAssignmentResponse> getAssignmentsByQuiz(UUID quizId, String username, Set<String> authorities) {
        quizAccessService.validateAccessByQuiz(username, authorities, quizId);
        return assignmentRepo.findByQuizIdAndDeletedAtIsNull(quizId).stream()
                .map(quizMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QuizAssignmentResponse getAssignmentById(UUID assignmentId, String username, Set<String> authorities) {
        QuizAssignmentEntity assignment = getAssignmentEntity(assignmentId);
        quizAccessService.validateAccessByQuiz(username, authorities, assignment.getQuizId());
        if (assignment.getDeletedAt() != null) {
            throw new DataNotFoundException("Assignment not found.");
        }

        return quizMapper.toResponse(assignment);
    }

    @Override
    public List<QuizAssignmentResponse> getAssignmentsByCourseId(UUID courseId, String username,
                                                                 Set<String> authorities) {
        quizAccessService.validateAccessByCourse(username, authorities, courseId);
        var now = LocalDateTime.now();
        var filteredStatues = List.of(AssignmentStatus.SCHEDULED.name(), AssignmentStatus.ACTIVE.name());
        return assignmentRepo.findByCourseIdAndDeletedAtIsNullAndStartTimeAndStatuses(courseId, now, filteredStatues)
                .stream()
                .map(quizMapper::toResponse)
                .collect(Collectors.toList());
    }

    private QuizAssignmentEntity getAssignmentEntity(UUID assignmentId) {
        return RedisUtils.getOptionalDataFromCacheOrDb(
                RedisPrefixConstant.QUIZ_ASSIGNMENT_PREFIX + assignmentId,
                QuizAssignmentEntity.class,
                () -> assignmentRepo.findByIdAndDeletedAtIsNull(assignmentId),
                RedisDurationConstant.QUIZ_DATA_DURATION);
    }

    private void invalidAssignment(UUID assignmentId) {
        RedisUtils.invalidateCache(RedisPrefixConstant.QUIZ_ASSIGNMENT_PREFIX + assignmentId);
    }
}
