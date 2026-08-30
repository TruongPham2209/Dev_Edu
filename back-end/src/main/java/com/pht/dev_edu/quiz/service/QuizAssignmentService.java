package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.CreateAssignmentRequest;
import com.pht.dev_edu.quiz.dto.response.QuizAssignmentResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service for managing quiz assignments / test sessions published to courses.
 */
public interface QuizAssignmentService {

    /**
     * Creates a new assignment for a quiz with start/end time, attempt limits, and optional passcode.
     *
     * @param request     the {@link CreateAssignmentRequest} containing assignment settings.
     * @param username    the username of the instructor or administrator.
     * @param authorities the authorities/roles of the current user.
     * @return the created {@link QuizAssignmentResponse}.
     */
    QuizAssignmentResponse createAssignment(CreateAssignmentRequest request, String username, Set<String> authorities);

    /**
     * Deletes a quiz assignment by ID.
     *
     * @param assignmentId the UUID of the assignment to delete.
     * @param username     the username of the user requesting deletion.
     * @param authorities  the authorities/roles of the current user.
     */
    void deleteAssignment(UUID assignmentId, String username, Set<String> authorities);

    /**
     * Retrieves all assignments created for a specific quiz.
     *
     * @param quizId      the UUID of the quiz.
     * @param username    the username of the requesting user.
     * @param authorities the authorities/roles of the current user.
     * @return a list of {@link QuizAssignmentResponse} items.
     */
    List<QuizAssignmentResponse> getAssignmentsByQuiz(UUID quizId, String username, Set<String> authorities);

    /**
     * Retrieves detailed information of a specific assignment.
     *
     * @param assignmentId the UUID of the assignment.
     * @param username     the username of the viewing user.
     * @param authorities  the authorities/roles of the current user.
     * @return the {@link QuizAssignmentResponse}.
     */
    QuizAssignmentResponse getAssignmentById(UUID assignmentId, String username, Set<String> authorities);

    /**
     * Retrieves all quiz assignments belonging to a specific course.
     *
     * @param courseId    the UUID of the course.
     * @param username    the username of the viewing user.
     * @param authorities the authorities/roles of the current user.
     * @return a list of {@link QuizAssignmentResponse} items.
     */
    List<QuizAssignmentResponse> getAssignmentsByCourseId(UUID courseId, String username, Set<String> authorities);
}
