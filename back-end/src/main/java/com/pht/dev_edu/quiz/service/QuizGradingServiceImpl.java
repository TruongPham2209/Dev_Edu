package com.pht.dev_edu.quiz.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.exception.data.DataNotFoundException;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.quiz.dto.enums.AttemptStatus;
import com.pht.dev_edu.quiz.dto.enums.QuestionType;
import com.pht.dev_edu.quiz.dto.enums.QuizAuditAction;
import com.pht.dev_edu.quiz.dto.projection.QuizEssaySubmissionProjection;
import com.pht.dev_edu.quiz.dto.request.GradeEssayRequest;
import com.pht.dev_edu.quiz.dto.response.AttemptResultResponse;
import com.pht.dev_edu.quiz.dto.response.QuizEssaySubmissionResponse;
import com.pht.dev_edu.quiz.entity.QuizAttemptAnswerEntity;
import com.pht.dev_edu.quiz.entity.QuizAttemptEntity;
import com.pht.dev_edu.quiz.entity.QuizEssayGradingEntity;
import com.pht.dev_edu.quiz.entity.QuizQuestionEntity;
import com.pht.dev_edu.quiz.repo.QuizAttemptAnswerRepo;
import com.pht.dev_edu.quiz.repo.QuizAttemptRepo;
import com.pht.dev_edu.quiz.repo.QuizEssayGradingRepo;
import com.pht.dev_edu.quiz.repo.QuizQuestionRepo;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class QuizGradingServiceImpl implements QuizGradingService {
    QuizAttemptRepo attemptRepo;
    QuizQuestionRepo questionRepo;
    QuizAttemptAnswerRepo answerRepo;
    QuizEssayGradingRepo essayGradingRepo;

    QuizAccessService quizAccessService;
    QuizAttemptService attemptService;
    QuizAuditService auditService;

    private static final int DEFAULT_ESSAY_PAGE_SIZE = 10;

    @Override
    public CustomPaging<QuizEssaySubmissionResponse> getEssaySubmissions(
            UUID quizId, String essayStatus, String nextCursor, String graderUsername,
            Set<String> authorities) {
        quizAccessService.validateAccessByQuiz(graderUsername, authorities, quizId);

        String normalizedStatus = StringUtils.hasText(essayStatus) ? essayStatus.toUpperCase().trim() : "ALL";
        TimeStampCursor cursor = resolveCursor(nextCursor);

        List<QuizEssaySubmissionProjection> projections = answerRepo
                .findEssaySubmissionsByQuizIdAndStatusAndCursor(
                        quizId,
                        normalizedStatus,
                        cursor.getId(),
                        cursor.getTimeStamp(),
                        DEFAULT_ESSAY_PAGE_SIZE + 1);

        return PagingUtils.getPagedWithCursor(
                projections,
                p -> QuizEssaySubmissionResponse.builder()
                        .attemptAnswerId(p.getAttemptAnswerId())
                        .attemptId(p.getAttemptId())
                        .questionId(p.getQuestionId())
                        .assignmentId(p.getAssignmentId())
                        .assignmentName(p.getAssignmentName())
                        .studentUsername(p.getStudentUsername())
                        .studentFullName(p.getStudentFullName())
                        .submittedAt(p.getSubmittedAt())
                        .lastSavedAt(p.getLastSavedAt())
                        .questionContent(p.getQuestionContent())
                        .maxPoints(p.getMaxPoints())
                        .answerText(p.getAnswerText())
                        .awardedPoints(p.getAwardedPoints())
                        .feedback(p.getFeedback())
                        .gradedBy(p.getGradedBy())
                        .gradedAt(p.getGradedAt())
                        .essayStatus(p.getEssayStatus())
                        .build(),
                QuizEssaySubmissionProjection::getSubmittedAt,
                QuizEssaySubmissionProjection::getAttemptAnswerId,
                DEFAULT_ESSAY_PAGE_SIZE);
    }

    @Override
    @Transactional
    public AttemptResultResponse gradeEssayAnswer(UUID attemptId, UUID questionId, GradeEssayRequest request,
            String graderUsername, Set<String> authorities) {
        QuizAttemptEntity attempt = attemptRepo.findById(attemptId)
                .orElseThrow(() -> new DataNotFoundException(
                        "Attempt not found with ID: " + attemptId));
        quizAccessService.validateAccessByQuiz(graderUsername, authorities, attempt.getQuizId());

        if (attempt.getStatus() != AttemptStatus.GRADING) {
            throw new BadRequestException("Attempt is not in GRADING status.");
        }

        QuizQuestionEntity question = questionRepo.findByIdAndDeletedAtIsNull(questionId)
                .orElseThrow(() -> new DataNotFoundException(
                        "Question not found with ID: " + questionId));

        if (question.getQuestionType() != QuestionType.ESSAY) {
            throw new BadRequestException("Only ESSAY questions can be manually graded.");
        }

        if (request.getAwardedPoints().compareTo(question.getPoints()) > 0) {
            throw new BadRequestException("Awarded points (" + request.getAwardedPoints()
                    + ") cannot exceed maximum question points (" + question.getPoints() + ").");
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
        int ungadedCount = answerRepo.countByAttemptIdAndQuestionTypeAndAwardedPointsIsNull(attemptId,
                QuestionType.ESSAY);
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

        auditService.log("ATTEMPT_ANSWER", answer.getId(), QuizAuditAction.GRADE, graderUsername, null, answer,
                request.getFeedback());

        return attemptService.getAttemptResult(attemptId, graderUsername, true);
    }

    private TimeStampCursor resolveCursor(String nextCursor) {
        return StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
    }
}
