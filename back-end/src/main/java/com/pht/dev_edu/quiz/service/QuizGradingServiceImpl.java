package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.request.GradeEssayRequest;
import com.pht.dev_edu.quiz.dto.response.AttemptResultResponse;
import com.pht.dev_edu.quiz.dto.response.SubmitAttemptResponse;
import com.pht.dev_edu.quiz.entity.*;
import com.pht.dev_edu.quiz.repo.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizGradingServiceImpl implements QuizGradingService {
    QuizAttemptRepo attemptRepo;
    QuizQuestionRepo questionRepo;
    QuizAttemptAnswerRepo answerRepo;
    QuizEssayGradingRepo essayGradingRepo;
    QuizAttemptService attemptService;
    QuizAuditService auditService;

    @Override
    public Page<SubmitAttemptResponse> getPendingEssayAttempts(Pageable pageable) {
        return attemptRepo.findByStatus(AttemptStatus.GRADING, pageable)
                .map(a -> SubmitAttemptResponse.builder()
                        .attemptId(a.getId())
                        .status(a.getStatus())
                        .submittedAt(a.getSubmittedAt())
                        .totalScore(a.getTotalScore())
                        .maxScore(a.getMaxScore())
                        .build());
    }

    @Override
    @Transactional
    public AttemptResultResponse gradeEssayAnswer(UUID attemptId, UUID questionId, GradeEssayRequest request, String graderUsername) {
        QuizAttemptEntity attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new DataNotFoundException("Attempt not found with ID: " + attemptId));

        if (attempt.getStatus() != AttemptStatus.GRADING) {
            throw new BadRequestException("Attempt is not in GRADING status.");
        }

        QuizQuestionEntity question = questionRepo.findByIdAndDeletedAtIsNull(questionId)
                .orElseThrow(() -> new DataNotFoundException("Question not found with ID: " + questionId));

        if (question.getQuestionType() != QuestionType.ESSAY) {
            throw new BadRequestException("Only ESSAY questions can be manually graded.");
        }

        if (request.getAwardedPoints().compareTo(question.getPoints()) > 0) {
            throw new BadRequestException("Awarded points (" + request.getAwardedPoints() + ") cannot exceed maximum question points (" + question.getPoints() + ").");
        }

        QuizAttemptAnswerEntity answer = answerRepo.findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseGet(() -> QuizAttemptAnswerEntity.builder()
                        .attemptId(attemptId)
                        .questionId(questionId)
                        .questionType(QuestionType.ESSAY)
                        .build());

        LocalDateTime now = LocalDateTime.now();
        answer.setAwardedPoints(request.getAwardedPoints());
        answer.setGradedBy(graderUsername);
        answer.setGradedAt(now);
        answerRepo.save(answer);

        // Insert history record into quiz_essay_gradings
        QuizEssayGradingEntity essayGrading = QuizEssayGradingEntity.builder()
                .attemptAnswerId(answer.getId())
                .questionId(questionId)
                .attemptId(attemptId)
                .graderUsername(graderUsername)
                .awardedPoints(request.getAwardedPoints())
                .feedback(request.getFeedback())
                .gradedAt(now)
                .build();

        essayGradingRepo.save(essayGrading);

        // Check if any ungaded essay question remains for this attempt
        int ungadedCount = answerRepo.countByAttemptIdAndQuestionTypeAndAwardedPointsIsNull(attemptId, QuestionType.ESSAY);
        if (ungadedCount == 0) {
            // All essay questions graded -> Recalculate total score
            List<QuizAttemptAnswerEntity> allAnswers = answerRepo.findByAttemptId(attemptId);
            BigDecimal totalScore = allAnswers.stream()
                    .map(QuizAttemptAnswerEntity::getAwardedPoints)
                    .filter(java.util.Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            attempt.setStatus(AttemptStatus.GRADED);
            attempt.setGradedAt(now);
            attempt.setTotalScore(totalScore);
            attemptRepo.save(attempt);
        }

        auditService.log("ATTEMPT_ANSWER", answer.getId(), QuizAuditAction.GRADE, graderUsername, null, answer, request.getFeedback());

        return attemptService.getAttemptResult(attemptId, graderUsername, true);
    }
}
