package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.constant.RedisPrefixConstant;
import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.common.util.RedisUtils;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.dto.enums.ScoringMethod;
import com.pht.dev_edu.quiz.dto.request.QuizRequest;
import com.pht.dev_edu.quiz.dto.request.QuizReviewRequest;
import com.pht.dev_edu.quiz.dto.request.QuizTypeConfigRequest;
import com.pht.dev_edu.quiz.dto.response.QuizDetailResponse;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;
import com.pht.dev_edu.quiz.dto.response.QuizTypeConfigResponse;
import com.pht.dev_edu.quiz.entity.QuizEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionOptionEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionTypeConfigEntity;
import com.pht.dev_edu.quiz.mapper.QuizMapper;
import com.pht.dev_edu.quiz.repo.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
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
    QuizService quizService;
    QuizAuditService auditService;
    QuizAccessService quizAccessService;

    private static final Integer QUIZ_PAGE_SIZE = 10;

    @Override
    @Transactional
    public QuizResponse createQuiz(QuizRequest request, String username, Set<String> authorities) {
        quizAccessService.validateAccessByCourse(username, authorities, request.getCourseId());

        QuizEntity quiz = quizMapper.toEntity(request, username);

        quizRepo.save(quiz);
        auditService.log("QUIZ", quiz.getId(), QuizAuditAction.CREATE_QUIZ, username, null, quiz,
                "Created quiz in DRAFT status");
        return quizMapper.toResponse(quiz);
    }

    @Override
    @Transactional
    public QuizResponse updateQuiz(UUID quizId, QuizRequest request, String username, Set<String> authorities) {
        quizAccessService.validateAccessByQuiz(username, authorities, quizId);

        QuizEntity quiz = quizService.getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        if (quiz.getStatus() == QuizStatus.REJECTED) {
            quiz.setStatus(QuizStatus.DRAFT);
        }

        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quizRepo.save(quiz);

        auditService.log("QUIZ", quiz.getId(), QuizAuditAction.EDIT_QUIZ, username, null, quiz,
                "Updated quiz title/description");
        invalidateQuizCached(quizId);
        return quizMapper.toResponse(quiz);
    }

    @Override
    @Transactional
    public QuizResponse duplicateQuiz(UUID quizId, String username, Set<String> authorities) {
        quizAccessService.validateAccessByQuiz(username, authorities, quizId);
        var existingQuizDetail = quizService.getQuizDetailResponseFromCache(quizId);
        var existingQuiz = existingQuizDetail.getQuiz();
        var existingTypeConfigs = existingQuizDetail.getTypeConfigs();
        var existingQuestions = existingQuizDetail.getQuestions();

        var newQuiz = QuizEntity.builder()
                .title(existingQuiz.getTitle())
                .courseId(existingQuiz.getCourseId())
                .description(existingQuiz.getDescription())
                .status(QuizStatus.DRAFT)
                .createdBy(username)
                .build();
        quizRepo.save(newQuiz);

        if (!CollectionUtils.isEmpty(existingTypeConfigs)) {
            var newTypeConfigs = existingTypeConfigs.stream().map(
                    tc -> QuizQuestionTypeConfigEntity.builder()
                            .quizId(newQuiz.getId())
                            .requiredCount(tc.getRequiredCount())
                            .pointsPerQuestion(tc.getPointsPerQuestion())
                            .questionType(tc.getQuestionType())
                            .scoringMethod(tc.getScoringMethod())
                            .build())
                    .toList();
            typeConfigRepo.saveAll(newTypeConfigs);
        }

        if (!CollectionUtils.isEmpty(existingQuestions)) {
            for (var eq : existingQuestions) {
                var newQuestion = QuizQuestionEntity.builder()
                        .quizId(newQuiz.getId())
                        .questionType(eq.getQuestionType())
                        .content(eq.getContent())
                        .points(eq.getPoints())
                        .orderIndex(eq.getOrderIndex())
                        .build();
                questionRepo.save(newQuestion);

                if (!CollectionUtils.isEmpty(eq.getOptions())) {
                    var newOptions = eq.getOptions().stream().map(
                            opt -> QuizQuestionOptionEntity.builder()
                                    .questionId(newQuestion.getId())
                                    .optionText(opt.getOptionText())
                                    .isCorrect(opt.getIsCorrect())
                                    .orderIndex(opt.getOrderIndex())
                                    .build())
                            .toList();
                    optionRepo.saveAll(newOptions);
                }
            }
        }

        auditService.log("QUIZ", newQuiz.getId(), QuizAuditAction.CREATE_QUIZ, username, null, newQuiz,
                "Duplicated quiz from " + quizId);

        return quizMapper.toResponse(newQuiz);
    }

    @Override
    @Transactional
    public QuizTypeConfigResponse configureTypeConfig(UUID quizId, QuizTypeConfigRequest request, String username,
            Set<String> authorities) {
        QuizEntity quiz = quizService.getQuizEntityOrThrow(quizId);
        quizAccessService.validateAccessByQuiz(username, authorities, quizId);

        checkCanEditQuizStructure(quiz);

        // Validation: Cannot modify/add config if questions of that type already exist
        if (questionRepo.existsByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, request.getQuestionType())) {
            throw new BadRequestException("Cannot change question type configuration after questions of type "
                    + request.getQuestionType() + " have already been created.");
        }

        // Validate scoring method matches question type
        if (request.getQuestionType() == QuestionType.ESSAY && request.getScoringMethod() != ScoringMethod.MANUAL) {
            throw new BadRequestException("ESSAY question type must have scoring_method = MANUAL");
        }

        if (request.getQuestionType() != QuestionType.ESSAY && request.getScoringMethod() != ScoringMethod.AUTO) {
            throw new BadRequestException(
                    "SINGLE_CHOICE and MULTIPLE_CHOICE question types must have scoring_method = AUTO");
        }

        QuizQuestionTypeConfigEntity config = typeConfigRepo
                .findByQuizIdAndQuestionType(quizId, request.getQuestionType())
                .orElseGet(() -> {
                    QuizQuestionTypeConfigEntity created = quizMapper.toEntity(request);
                    created.setQuizId(quizId);
                    return created;
                });

        config.setRequiredCount(request.getRequiredCount());
        config.setPointsPerQuestion(request.getPointsPerQuestion());
        config.setScoringMethod(request.getScoringMethod());

        typeConfigRepo.save(config);
        invalidateQuizCached(quizId);
        return quizMapper.toResponse(config);
    }

    @Override
    public List<QuizTypeConfigResponse> getTypeConfigs(UUID quizId, String username, Set<String> authorities) {
        quizAccessService.validateAccessByQuiz(username, authorities, quizId);
        quizService.getQuizEntityOrThrow(quizId);
        return quizMapper.toTypeConfigResponseList(typeConfigRepo.findByQuizId(quizId));
    }

    @Override
    public void deleteTypeConfigs(UUID quizId, UUID typeConfigId, String username, Set<String> authorities) {
        quizAccessService.validateAccessByQuiz(username, authorities, quizId);
        QuizEntity quiz = quizService.getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        QuizQuestionTypeConfigEntity typeConfigEntity = typeConfigRepo.findById(typeConfigId).orElseThrow(
                () -> new BadRequestException("Type config not found"));
        if (!typeConfigEntity.getQuizId().equals(quizId)) {
            throw new BadRequestException("Type config not found for this quiz");
        }

        if (questionRepo.existsByQuizIdAndQuestionTypeAndDeletedAtIsNull(quizId, typeConfigEntity.getQuestionType())) {
            throw new BadRequestException("Cannot delete type config because questions of type "
                    + typeConfigEntity.getQuestionType() + " already exist.");
        }

        typeConfigRepo.delete(typeConfigEntity);
        invalidateQuizCached(quizId);
    }

    @Override
    @Transactional
    public QuizResponse submitQuizForApproval(UUID quizId, String username, Set<String> authorities) {
        QuizEntity quiz = quizService.getQuizEntityOrThrow(quizId);
        if (!quiz.getCreatedBy().equals(username)) {
            throw new BadRequestException("You can only submit your own quizzes for approval.");
        }

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
        invalidateQuizCached(quizId);
        return quizMapper.toResponse(quiz);
    }

    @Override
    @Transactional
    public QuizResponse reviewQuiz(UUID quizId, QuizReviewRequest request, String username) {
        QuizEntity quiz = quizService.getQuizEntityOrThrow(quizId);

        if (quiz.getStatus() != QuizStatus.PENDING) {
            throw new BadRequestException("Quiz is not in PENDING status for review.");
        }

        var now = LocalDateTime.now();

        if (Boolean.TRUE.equals(request.getApproved())) {
            quiz.setStatus(QuizStatus.APPROVED);
            quiz.setApprovedBy(username);
            quiz.setApprovedAt(now);

            auditService.log("QUIZ", quizId, QuizAuditAction.APPROVE, username, null, quiz, "Admin approved quiz");
        } else {
            if (request.getRejectionReason() == null || request.getRejectionReason().isBlank()) {
                throw new BadRequestException("Rejection reason is required when rejecting a quiz.");
            }

            quiz.setStatus(QuizStatus.REJECTED);
            quiz.setRejectedBy(username);
            quiz.setRejectedAt(now);
            quiz.setRejectionReason(request.getRejectionReason());

            auditService.log("QUIZ", quizId, QuizAuditAction.REJECT, username, null, quiz,
                    "Admin rejected quiz: " + request.getRejectionReason());
        }
        quiz.setReviewedBy(username);
        quiz.setReviewedAt(now);
        quizRepo.save(quiz);

        invalidateQuizCached(quizId);
        return quizMapper.toResponse(quiz);
    }

    @Override
    public QuizDetailResponse getQuizDetail(UUID quizId, String username, Set<String> authorities) {
        quizAccessService.validateAccessByQuiz(username, authorities, quizId);
        return quizService.getQuizDetailResponseFromCache(quizId);
    }

    @Override
    public CustomPaging<QuizResponse> getQuizzesByCourse(UUID courseId,
            String keyword, QuizStatus status, String nextCursor,
            String username,
            Set<String> authorities) {
        quizAccessService.validateAccessByCourse(username, authorities, courseId);
        TimeStampCursor cursor = resolveCursor(nextCursor);

        var quizzes = quizRepo.findByCourseIdAndDeletedAtIsNull(courseId,
                status != null ? status.name() : null, keyword, cursor.getId(),
                cursor.getTimeStamp(),
                QUIZ_PAGE_SIZE + 1);
        return PagingUtils.getPagedWithCursor(
                quizzes,
                quizMapper::toResponse,
                QuizEntity::getCreatedAt,
                QuizEntity::getId,
                QUIZ_PAGE_SIZE);
    }

    @Override
    public CustomPaging<QuizResponse> getQuizzes(QuizStatus status, String keyword, String nextCursor) {
        TimeStampCursor cursor = resolveCursor(nextCursor);

        var quizzes = quizRepo.findByStatusAndDeletedAtIsNull(
                status != null ? status.name() : null, keyword, cursor.getId(), cursor.getTimeStamp(),
                QUIZ_PAGE_SIZE + 1);
        return PagingUtils.getPagedWithCursor(
                quizzes,
                quizMapper::toResponse,
                QuizEntity::getCreatedAt,
                QuizEntity::getId,
                QUIZ_PAGE_SIZE);
    }

    private void checkCanEditQuizStructure(QuizEntity quiz) {
        if (quiz.getStatus() == QuizStatus.PENDING) {
            throw new BadRequestException("Quiz is pending approval and cannot be edited.");
        }

        // Quiz has assignment cannot be edited
        if (quiz.getStatus() == QuizStatus.APPROVED) {
            boolean hasAssignments = assignmentRepo.existsByQuizIdAndDeletedAtIsNull(quiz.getId());
            if (hasAssignments) {
                throw new BadRequestException(
                        "Cannot edit quiz structure because active assignments already exist for this approved quiz.");
            }
        }
    }

    private TimeStampCursor resolveCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }

    private void invalidateQuizCached(UUID quizId) {
        RedisUtils.invalidateCache(RedisPrefixConstant.QUIZ_PREFIX + quizId);
        RedisUtils.invalidateCache(RedisPrefixConstant.QUIZ_DETAIL_PREFIX + quizId);
    }
}
