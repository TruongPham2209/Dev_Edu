package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.quiz.dto.enums.QuizStatus;
import com.pht.dev_edu.quiz.dto.request.QuizRequest;
import com.pht.dev_edu.quiz.dto.request.QuizReviewRequest;
import com.pht.dev_edu.quiz.dto.request.QuizTypeConfigRequest;
import com.pht.dev_edu.quiz.dto.response.QuizDetailResponse;
import com.pht.dev_edu.quiz.dto.response.QuizResponse;
import com.pht.dev_edu.quiz.dto.response.QuizTypeConfigResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service for managing quiz lifecycle (CRUD, approval workflow, question-type configurations, duplication).
 */
public interface QuizManagementService {

    /**
     * Creates a new draft quiz for a course.
     *
     * @param request     the {@link QuizRequest} containing title, description, duration, passing score, and course ID.
     * @param username    the username of the quiz creator.
     * @param authorities the authorities/roles of the current user.
     * @return the created {@link QuizResponse}.
     */
    QuizResponse createQuiz(QuizRequest request, String username, Set<String> authorities);

    /**
     * Updates an existing quiz.
     *
     * @param quizId      the UUID of the quiz.
     * @param request     the {@link QuizRequest} containing updated data.
     * @param username    the username of the user updating the quiz.
     * @param authorities the authorities/roles of the current user.
     * @return the updated {@link QuizResponse}.
     */
    QuizResponse updateQuiz(UUID quizId, QuizRequest request, String username, Set<String> authorities);

    /**
     * Clones / duplicates a quiz along with its question type configurations and questions.
     *
     * @param quizId      the UUID of the source quiz to duplicate.
     * @param username    the username of the user performing duplication.
     * @param authorities the authorities/roles of the current user.
     * @return the cloned {@link QuizResponse}.
     */
    QuizResponse duplicateQuiz(UUID quizId, String username, Set<String> authorities);

    /**
     * Configures question type quota and points (e.g. MULTIPLE_CHOICE, ESSAY) for a quiz.
     *
     * @param quizId      the UUID of the quiz.
     * @param request     the {@link QuizTypeConfigRequest} specifying question type, quantity, and points.
     * @param username    the username of the user.
     * @param authorities the authorities/roles of the user.
     * @return the configured {@link QuizTypeConfigResponse}.
     */
    QuizTypeConfigResponse configureTypeConfig(UUID quizId, QuizTypeConfigRequest request, String username,
            Set<String> authorities);

    /**
     * Retrieves all question type configurations for a quiz.
     *
     * @param quizId      the UUID of the quiz.
     * @param username    the username of the requesting user.
     * @param authorities the authorities/roles of the user.
     * @return a list of {@link QuizTypeConfigResponse} items.
     */
    List<QuizTypeConfigResponse> getTypeConfigs(UUID quizId, String username, Set<String> authorities);

    /**
     * Deletes a question type configuration from a quiz.
     *
     * @param quizId       the UUID of the quiz.
     * @param typeConfigId the UUID of the type configuration to delete.
     * @param username     the username of the requesting user.
     * @param authorities  the authorities/roles of the user.
     */
    void deleteTypeConfigs(UUID quizId, UUID typeConfigId, String username, Set<String> authorities);

    /**
     * Submits a draft quiz for administrator review and approval.
     *
     * @param quizId      the UUID of the quiz to submit.
     * @param username    the username of the instructor submitting the quiz.
     * @param authorities the authorities/roles of the user.
     * @return the updated {@link QuizResponse}.
     */
    QuizResponse submitQuizForApproval(UUID quizId, String username, Set<String> authorities);

    /**
     * Reviews and approves/rejects a submitted quiz (Admin action).
     *
     * @param quizId   the UUID of the quiz under review.
     * @param request  the {@link QuizReviewRequest} containing approval action and remarks.
     * @param username the username of the administrator reviewing the quiz.
     * @return the reviewed {@link QuizResponse}.
     */
    QuizResponse reviewQuiz(UUID quizId, QuizReviewRequest request, String username);

    /**
     * Retrieves detailed information of a quiz (including question type configs and questions).
     *
     * @param quizId      the UUID of the quiz.
     * @param username    the username of the requesting user.
     * @param authorities the authorities/roles of the user.
     * @return the {@link QuizDetailResponse}.
     */
    QuizDetailResponse getQuizDetail(UUID quizId, String username, Set<String> authorities);

    /**
     * Retrieves quizzes belonging to a specific course with keyword filtering, status filter, and cursor pagination.
     *
     * @param courseId    the UUID of the course.
     * @param keyword     the search keyword (optional).
     * @param status      the {@link QuizStatus} filter.
     * @param nextCursor  the cursor token for pagination.
     * @param username    the username of the requesting user.
     * @param authorities the authorities/roles of the user.
     * @return a {@link CustomPaging} of {@link QuizResponse} items.
     */
    CustomPaging<QuizResponse> getQuizzesByCourse(UUID courseId, String keyword, QuizStatus status, String nextCursor,
            String username, Set<String> authorities);

    /**
     * Retrieves all quizzes across the system (Admin action) with status and keyword filtering.
     *
     * @param status     the {@link QuizStatus} filter.
     * @param keyword    the search keyword (optional).
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link QuizResponse} items.
     */
    CustomPaging<QuizResponse> getQuizzes(QuizStatus status, String keyword, String nextCursor);
}
