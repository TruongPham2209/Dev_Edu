package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.quiz.dto.enums.AssignmentStatus;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.dto.request.CreateAssignmentRequest;
import com.pht.dev_edu.quiz.dto.response.QuizAssignmentResponse;
import com.pht.dev_edu.quiz.entity.QuizAssignmentEntity;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.QuizAssignmentRepo;
import com.pht.dev_edu.quiz.repo.QuizRepo;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizAssignmentServiceImpl implements QuizAssignmentService {
    QuizAssignmentRepo assignmentRepo;
    QuizRepo quizRepo;
    QuizMapper quizMapper;
    QuizAuditService auditService;

    @Override
    @Transactional
    public QuizAssignmentResponse createAssignment(CreateAssignmentRequest request, String username) {
        QuizEntity quiz = quizRepo.findByIdAndDeletedAtIsNull(request.getQuizId())
                .orElseThrow(() -> new DataNotFoundException("Quiz not found with ID: " + request.getQuizId()));

        if (quiz.getStatus() != QuizStatus.APPROVED) {
            throw new BadRequestException("Quiz must be APPROVED before creating an assignment.");
        }

        if (request.getEndTime() != null && request.getEndTime().isBefore(request.getStartTime())) {
            throw new BadRequestException("End time cannot be before start time.");
        }

        AssignmentStatus initialStatus = AssignmentStatus.SCHEDULED;
        LocalDateTime now = LocalDateTime.now();
        if (!request.getStartTime().isAfter(now) && (request.getEndTime() == null || request.getEndTime().isAfter(now))) {
            initialStatus = AssignmentStatus.ACTIVE;
        }

        QuizAssignmentEntity assignment = QuizAssignmentEntity.builder()
                .quizId(request.getQuizId())
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

        auditService.log("ASSIGNMENT", assignment.getId(), QuizAuditAction.CREATE_ASSIGNMENT, username, null, assignment, "Created quiz assignment");
        return quizMapper.toResponse(assignment);
    }

    @Override
    public List<QuizAssignmentResponse> getAssignmentsByQuiz(UUID quizId) {
        return assignmentRepo.findByQuizIdAndDeletedAtIsNull(quizId).stream()
                .map(quizMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QuizAssignmentResponse getAssignmentById(UUID assignmentId) {
        QuizAssignmentEntity assignment = assignmentRepo.findByIdAndDeletedAtIsNull(assignmentId)
                .orElseThrow(() -> new DataNotFoundException("Assignment not found with ID: " + assignmentId));
        return quizMapper.toResponse(assignment);
    }
}
