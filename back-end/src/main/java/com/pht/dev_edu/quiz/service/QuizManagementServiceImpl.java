package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.quiz.dto.enums.*;
import com.pht.dev_edu.quiz.dto.request.*;
import com.pht.dev_edu.quiz.dto.response.*;
import com.pht.dev_edu.quiz.entity.*;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizManagementServiceImpl implements QuizManagementService {
    QuizRepo quizRepo;
    QuizQuestionTypeConfigRepo typeConfigRepo;
    QuizQuestionRepo questionRepo;
    QuizQuestionOptionRepo optionRepo;
    QuizAssignmentRepo assignmentRepo;
    QuizMapper quizMapper;
    QuizAuditService auditService;

    @Override
    @Transactional
    public QuizResponse createQuiz(QuizRequest request, String username) {
        QuizEntity quiz = QuizEntity.builder()
                .courseId(request.getCourseId())
                .title(request.getTitle())
                .description(request.getDescription())
                .status(QuizStatus.DRAFT)
                .createdBy(username)
                .build();

        quizRepo.save(quiz);
        auditService.log("QUIZ", quiz.getId(), QuizAuditAction.CREATE_QUIZ, username, null, quiz,
                "Created quiz in DRAFT status");
        return quizMapper.toResponse(quiz);
    }

    @Override
    @Transactional
    public QuizResponse updateQuiz(UUID quizId, QuizRequest request, String username) {
        QuizEntity quiz = getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        if (quiz.getStatus() == QuizStatus.REJECTED) {
            quiz.setStatus(QuizStatus.DRAFT);
        }

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quizRepo.save(quiz);

        auditService.log("QUIZ", quiz.getId(), QuizAuditAction.EDIT_QUIZ, username, null, quiz,
                "Updated quiz title/description");
        return quizMapper.toResponse(quiz);
    }

    @Override
    @Transactional
    public QuizTypeConfigResponse configureTypeConfig(UUID quizId, QuizTypeConfigRequest request, String username) {
        QuizEntity quiz = getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        // Validation: Cannot modify/add config if questions of that type already exist
        if (questionRepo.existsByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, request.getQuestionType())) {
            throw new BadRequestException("Cannot change question type configuration after questions of type "
                    + request.getQuestionType() + " have already been created.");
        }

        // Validate scoring method matches question type
        if (request.getQuestionType() == QuestionType.ESSAY) {
            if (request.getScoringMethod() != ScoringMethod.MANUAL) {
                throw new BadRequestException("ESSAY question type must have scoring_method = MANUAL");
            }
        } else {
            if (request.getScoringMethod() != ScoringMethod.AUTO) {
                throw new BadRequestException(
                        "SINGLE_CHOICE and MULTIPLE_CHOICE question types must have scoring_method = AUTO");
            }
        }

        QuizQuestionTypeConfigEntity config = typeConfigRepo
                .findByQuizIdAndQuestionType(quizId, request.getQuestionType())
                .orElseGet(() -> QuizQuestionTypeConfigEntity.builder()
                        .quizId(quizId)
                        .questionType(request.getQuestionType())
                        .build());

        config.setRequiredCount(request.getRequiredCount());
        config.setPointsPerQuestion(request.getPointsPerQuestion());
        config.setScoringMethod(request.getScoringMethod());

        typeConfigRepo.save(config);
        return quizMapper.toResponse(config);
    }

    @Override
    public List<QuizTypeConfigResponse> getTypeConfigs(UUID quizId) {
        getQuizEntityOrThrow(quizId);
        return quizMapper.toTypeConfigResponseList(typeConfigRepo.findByQuizId(quizId));
    }

    @Override
    @Transactional
    public QuizQuestionResponse addQuestion(UUID quizId, QuizQuestionRequest request, String username) {
        QuizEntity quiz = getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        // Find config
        QuizQuestionTypeConfigEntity config = typeConfigRepo
                .findByQuizIdAndQuestionType(quizId, request.getQuestionType())
                .orElseThrow(() -> new BadRequestException("Question type configuration for "
                        + request.getQuestionType() + " must be created before adding questions."));

        // Check count limit
        int currentCount = questionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId,
                request.getQuestionType());
        if (currentCount >= config.getRequiredCount()) {
            throw new BadRequestException("Cannot add question. Total questions for type " + request.getQuestionType()
                    + " reaches the required limit of " + config.getRequiredCount());
        }

        validateOptionsForQuestionType(request.getQuestionType(), request.getOptions());

        QuizQuestionEntity question = QuizQuestionEntity.builder()
                .quizId(quizId)
                .questionType(request.getQuestionType())
                .content(request.getContent())
                .points(config.getPointsPerQuestion())
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : currentCount + 1)
                .build();

        questionRepo.save(question);

        List<QuizQuestionOptionEntity> savedOptions = new ArrayList<>();
        if (!CollectionUtils.isEmpty(request.getOptions())) {
            int optOrder = 1;
            for (QuizQuestionOptionRequest optReq : request.getOptions()) {
                QuizQuestionOptionEntity option = QuizQuestionOptionEntity.builder()
                        .questionId(question.getId())
                        .optionText(optReq.getOptionText())
                        .isCorrect(optReq.getIsCorrect())
                        .orderIndex(optReq.getOrderIndex() != null ? optReq.getOrderIndex() : optOrder++)
                        .build();
                savedOptions.add(optionRepo.save(option));
            }
        }

        QuizQuestionResponse response = quizMapper.toResponse(question);
        response.setOptions(quizMapper.toOptionResponseList(savedOptions));
        return response;
    }

    @Override
    @Transactional
    public QuizQuestionResponse updateQuestion(UUID quizId, UUID questionId, QuizQuestionRequest request,
            String username) {
        QuizEntity quiz = getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        QuizQuestionEntity question = questionRepo.findByIdAndDeletedAtIsNull(questionId)
                .orElseThrow(() -> new DataNotFoundException("Question not found with ID: " + questionId));

        if (!question.getQuizId().equals(quizId)) {
            throw new BadRequestException("Question does not belong to the specified quiz");
        }

        validateOptionsForQuestionType(request.getQuestionType(), request.getOptions());

        question.setContent(request.getContent());
        if (request.getOrderIndex() != null) {
            question.setOrderIndex(request.getOrderIndex());
        }
        questionRepo.save(question);

        // Delete old options and save new options
        optionRepo.deleteByQuestionId(questionId);
        List<QuizQuestionOptionEntity> savedOptions = new ArrayList<>();
        if (!CollectionUtils.isEmpty(request.getOptions())) {
            int optOrder = 1;
            for (QuizQuestionOptionRequest optReq : request.getOptions()) {
                QuizQuestionOptionEntity option = QuizQuestionOptionEntity.builder()
                        .questionId(question.getId())
                        .optionText(optReq.getOptionText())
                        .isCorrect(optReq.getIsCorrect())
                        .orderIndex(optReq.getOrderIndex() != null ? optReq.getOrderIndex() : optOrder++)
                        .build();
                savedOptions.add(optionRepo.save(option));
            }
        }

        QuizQuestionResponse response = quizMapper.toResponse(question);
        response.setOptions(quizMapper.toOptionResponseList(savedOptions));
        return response;
    }

    @Override
    @Transactional
    public void deleteQuestion(UUID quizId, UUID questionId, String username) {
        QuizEntity quiz = getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        QuizQuestionEntity question = questionRepo.findByIdAndDeletedAtIsNull(questionId)
                .orElseThrow(() -> new DataNotFoundException("Question not found with ID: " + questionId));

        if (!question.getQuizId().equals(quizId)) {
            throw new BadRequestException("Question does not belong to the specified quiz");
        }

        question.setDeletedAt(LocalDateTime.now());
        question.setDeletedBy(username);
        questionRepo.save(question);
    }

    @Override
    @Transactional
    public QuizResponse submitQuizForApproval(UUID quizId, String username) {
        QuizEntity quiz = getQuizEntityOrThrow(quizId);

        if (quiz.getStatus() != QuizStatus.DRAFT && quiz.getStatus() != QuizStatus.REJECTED) {
            throw new BadRequestException("Only quizzes in DRAFT or REJECTED status can be submitted for approval.");
        }

        List<QuizQuestionTypeConfigEntity> configs = typeConfigRepo.findByQuizId(quizId);
        if (CollectionUtils.isEmpty(configs)) {
            throw new BadRequestException("Cannot submit quiz without question type configurations.");
        }

        for (QuizQuestionTypeConfigEntity config : configs) {
            int actualCount = questionRepo.countByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId,
                    config.getQuestionType());
            if (actualCount != config.getRequiredCount()) {
                throw new BadRequestException("Question count mismatch for type " + config.getQuestionType()
                        + ". Required: " + config.getRequiredCount() + ", Actual: " + actualCount);
            }
        }

        quiz.setStatus(QuizStatus.PENDING);
        quiz.setSubmittedBy(username);
        quiz.setSubmittedAt(LocalDateTime.now());
        quizRepo.save(quiz);

        auditService.log("QUIZ", quizId, QuizAuditAction.SUBMIT_FOR_APPROVAL, username, null, quiz,
                "Submitted quiz for admin approval");
        return quizMapper.toResponse(quiz);
    }

    @Override
    @Transactional
    public QuizResponse reviewQuiz(UUID quizId, QuizReviewRequest request, String username) {
        QuizEntity quiz = getQuizEntityOrThrow(quizId);

        if (quiz.getStatus() != QuizStatus.PENDING) {
            throw new BadRequestException("Quiz is not in PENDING status for review.");
        }

        if (Boolean.TRUE.equals(request.getApproved())) {
            quiz.setStatus(QuizStatus.APPROVED);
            quiz.setApprovedBy(username);
            quiz.setApprovedAt(LocalDateTime.now());
            quiz.setReviewedBy(username);
            quiz.setReviewedAt(LocalDateTime.now());
            quizRepo.save(quiz);

            auditService.log("QUIZ", quizId, QuizAuditAction.APPROVE, username, null, quiz, "Admin approved quiz");
        } else {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new BadRequestException("Rejection reason is required when rejecting a quiz.");
            }

            quiz.setStatus(QuizStatus.REJECTED);
            quiz.setRejectedBy(username);
            quiz.setRejectedAt(LocalDateTime.now());
            quiz.setRejectionReason(request.getRejectionReason());
            quiz.setReviewedBy(username);
            quiz.setReviewedAt(LocalDateTime.now());
            quizRepo.save(quiz);

            auditService.log("QUIZ", quizId, QuizAuditAction.REJECT, username, null, quiz,
                    "Admin rejected quiz: " + request.getRejectionReason());
        }

        return quizMapper.toResponse(quiz);
    }

    @Override
    public QuizDetailResponse getQuizDetail(UUID quizId) {
        QuizEntity quiz = getQuizEntityOrThrow(quizId);
        List<QuizQuestionTypeConfigEntity> typeConfigs = typeConfigRepo.findByQuizId(quizId);
        List<QuizQuestionEntity> questions = questionRepo.findByQuizIdAndDeletedAtIsNullOrderByOrderIndexAsc(quizId);

        List<QuizQuestionResponse> questionResponses = new ArrayList<>();
        for (QuizQuestionEntity q : questions) {
            QuizQuestionResponse qResp = quizMapper.toResponse(q);
            List<QuizQuestionOptionEntity> options = optionRepo
                    .findByQuestionIdAndDeletedAtIsNullOrderByOrderIndexAsc(q.getId());
            qResp.setOptions(quizMapper.toOptionResponseList(options));
            questionResponses.add(qResp);
        }

        return QuizDetailResponse.builder()
                .quiz(quizMapper.toResponse(quiz))
                .typeConfigs(quizMapper.toTypeConfigResponseList(typeConfigs))
                .questions(questionResponses)
                .build();
    }

    @Override
    public Page<QuizResponse> getQuizzesByCourse(UUID courseId, Pageable pageable) {
        return quizRepo.findByCourseIdAndDeletedAtIsNull(courseId, pageable)
                .map(quizMapper::toResponse);
    }

    @Override
    public Page<QuizResponse> getPendingQuizzes(Pageable pageable) {
        return quizRepo.findByStatusAndDeletedAtIsNull(QuizStatus.PENDING, pageable)
                .map(quizMapper::toResponse);
    }

    private QuizEntity getQuizEntityOrThrow(UUID quizId) {
        return quizRepo.findByIdAndDeletedAtIsNull(quizId)
                .orElseThrow(() -> new DataNotFoundException("Quiz not found with ID: " + quizId));
    }

    private void checkCanEditQuizStructure(QuizEntity quiz) {
        if (quiz.getStatus() == QuizStatus.PENDING) {
            throw new BadRequestException("Quiz is pending approval and cannot be edited.");
        }
        if (quiz.getStatus() == QuizStatus.APPROVED) {
            boolean hasAssignments = assignmentRepo.existsByQuizIdAndDeletedAtIsNull(quiz.getId());
            if (hasAssignments) {
                throw new BadRequestException(
                        "Cannot edit quiz structure because active assignments already exist for this approved quiz.");
            }
        }
    }

    private void validateOptionsForQuestionType(QuestionType type, List<QuizQuestionOptionRequest> options) {
        if (type == QuestionType.ESSAY) {
            if (!CollectionUtils.isEmpty(options)) {
                throw new BadRequestException("ESSAY question must not have options.");
            }
            return;
        }

        if (CollectionUtils.isEmpty(options)) {
            throw new BadRequestException("Options are required for choice questions.");
        }

        long correctCount = options.stream().filter(o -> Boolean.TRUE.equals(o.getIsCorrect())).count();

        if (type == QuestionType.SINGLE_CHOICE) {
            if (correctCount != 1) {
                throw new BadRequestException(
                        "SINGLE_CHOICE question must have EXACTLY 1 correct option. Found: " + correctCount);
            }
        } else if (type == QuestionType.MULTIPLE_CHOICE) {
            if (correctCount < 2) {
                throw new BadRequestException(
                        "MULTIPLE_CHOICE question must have AT LEAST 2 correct options. Found: " + correctCount);
            }
        }
    }
}
