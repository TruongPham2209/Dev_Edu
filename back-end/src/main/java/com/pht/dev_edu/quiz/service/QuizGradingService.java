package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.quiz.dto.request.GradeEssayRequest;
import com.pht.dev_edu.quiz.dto.response.AttemptResultResponse;
import com.pht.dev_edu.quiz.dto.response.QuizEssaySubmissionResponse;

import java.util.Set;
import java.util.UUID;

/**
 * Service for manual grading and evaluation of essay / subjective questions in quizzes.
 */
public interface QuizGradingService {

    /**
     * Retrieves paginated essay submissions requiring grading for a quiz.
     *
     * @param quizId         the UUID of the quiz.
     * @param essayStatus    the grading status filter (PENDING_GRADE, GRADED).
     * @param nextCursor     the cursor token for pagination.
     * @param graderUsername the username of the grader (instructor/admin).
     * @param authorities    the authorities/roles of the grader.
     * @return a {@link CustomPaging} of {@link QuizEssaySubmissionResponse} items.
     */
    CustomPaging<QuizEssaySubmissionResponse> getEssaySubmissions(
            UUID quizId,
            String essayStatus,
            String nextCursor,
            String graderUsername,
            Set<String> authorities);

    /**
     * Grades an individual essay response within an attempt and updates the final score.
     *
     * @param attemptId      the UUID of the attempt.
     * @param questionId     the UUID of the essay question.
     * @param request        the {@link GradeEssayRequest} containing awarded score and feedback.
     * @param graderUsername the username of the grader.
     * @param authorities    the authorities/roles of the grader.
     * @return the updated {@link AttemptResultResponse}.
     */
    AttemptResultResponse gradeEssayAnswer(
            UUID attemptId,
            UUID questionId,
            GradeEssayRequest request,
            String graderUsername,
            Set<String> authorities);
}
