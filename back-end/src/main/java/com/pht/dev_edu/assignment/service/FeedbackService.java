package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.FeedbackRequest;
import com.pht.dev_edu.assignment.dto.FeedbackResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service for managing grading feedback and remarks on assignment submissions.
 */
public interface FeedbackService {

    /**
     * Retrieves all feedback records for a student's submission on a specific assignment.
     *
     * @param authorities     the authorities/roles of the current user.
     * @param actor           the username of the user requesting feedback.
     * @param assignmentId    the UUID of the assignment.
     * @param studentUsername the username of the student whose submission is being queried.
     * @return a list of {@link FeedbackResponse} objects.
     */
    List<FeedbackResponse> getFeedbacksByAssignment(Set<String> authorities, String actor, UUID assignmentId, String studentUsername);

    /**
     * Creates a new feedback entry for an assignment submission.
     *
     * @param authorities the authorities/roles of the current user (lecturer/admin).
     * @param author      the username of the feedback creator.
     * @param req         the {@link FeedbackRequest} containing grade score, comments, and submission ID.
     * @return the created {@link FeedbackResponse}.
     */
    FeedbackResponse create(Set<String> authorities, String author, FeedbackRequest req);

    /**
     * Deletes a feedback entry by ID.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user requesting the deletion.
     * @param feedbackId  the UUID of the feedback to delete.
     */
    void delete(Set<String> authorities, String actor, UUID feedbackId);
}
