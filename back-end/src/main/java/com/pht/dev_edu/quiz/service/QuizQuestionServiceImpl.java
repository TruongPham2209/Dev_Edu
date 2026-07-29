package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
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
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizQuestionServiceImpl implements QuizQuestionService {
    QuizQuestionTypeConfigRepo typeConfigRepo;
    QuizQuestionRepo questionRepo;
    QuizQuestionOptionRepo optionRepo;
    QuizAssignmentRepo assignmentRepo;

    QuizMapper quizMapper;
    QuizService quizService;

    @Override
    @Transactional
    public QuizQuestionResponse addQuestion(UUID quizId, QuizQuestionRequest request, String username, Set<String> authorities) {
        QuizEntity quiz = quizService.getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        // Set status back to DRAFT
        quiz.setStatus(QuizStatus.DRAFT);

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
                                               String username, Set<String> authorities) {
        QuizEntity quiz = quizService.getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        quiz.setStatus(QuizStatus.DRAFT);

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
    public void deleteQuestion(UUID quizId, UUID questionId, String username, Set<String> authorities) {
        QuizEntity quiz = quizService.getQuizEntityOrThrow(quizId);
        checkCanEditQuizStructure(quiz);

        quiz.setStatus(QuizStatus.DRAFT);

        QuizQuestionEntity question = questionRepo.findByIdAndDeletedAtIsNull(questionId)
                .orElseThrow(() -> new DataNotFoundException("Question not found with ID: " + questionId));

        if (!question.getQuizId().equals(quizId)) {
            throw new BadRequestException("Question does not belong to the specified quiz");
        }

        question.setDeletedAt(LocalDateTime.now());
        question.setDeletedBy(username);
        questionRepo.save(question);
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
