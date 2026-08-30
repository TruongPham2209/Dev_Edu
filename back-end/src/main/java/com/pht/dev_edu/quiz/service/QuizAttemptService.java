package com.pht.dev_edu.quiz.service;

import com.pht.dev_edu.quiz.dto.request.AutosaveRequest;
import com.pht.dev_edu.quiz.dto.request.HeartbeatRequest;
import com.pht.dev_edu.quiz.dto.response.AttemptResultResponse;
import com.pht.dev_edu.quiz.dto.response.AutosaveResponse;
import com.pht.dev_edu.quiz.dto.response.QuizAttemptReviewResponse;
import com.pht.dev_edu.quiz.dto.response.StartAttemptResponse;
import com.pht.dev_edu.quiz.dto.response.SubmitAttemptResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing student test-taking sessions (Quiz Attempts): starting attempts, autosaving answers, heartbeats, and submission.
 */
public interface QuizAttemptService {

    /**
     * Starts a new test attempt for a student on an assignment.
     *
     * @param assignmentId the UUID of the assignment.
     * @param username     the username of the student.
     * @param sessionToken the unique session token.
     * @return the {@link StartAttemptResponse} containing questions and attempt session metadata.
     */
    StartAttemptResponse startAttempt(UUID assignmentId, String username, String sessionToken);

    /**
     * Autosaves a student's answer for a specific question during an active attempt.
     *
     * @param attemptId the UUID of the attempt session.
     * @param request   the {@link AutosaveRequest} containing question ID and answer choice.
     * @param username  the username of the student.
     * @return the {@link AutosaveResponse}.
     */
    AutosaveResponse autosaveAnswer(UUID attemptId, AutosaveRequest request, String username);

    /**
     * Submits a student's test attempt, auto-grading objective questions.
     *
     * @param attemptId the UUID of the attempt.
     * @param username  the username of the student or system auto-submit identifier.
     * @return the {@link SubmitAttemptResponse} containing submission results.
     */
    SubmitAttemptResponse submitAttempt(UUID attemptId, String username);

    /**
     * Records a periodic heartbeat signal to keep the attempt session alive and update time remaining.
     *
     * @param attemptId the UUID of the attempt.
     * @param request   the {@link HeartbeatRequest} containing timestamp and remaining duration.
     * @param username  the username of the student.
     */
    void heartbeat(UUID attemptId, HeartbeatRequest request, String username);

    /**
     * Retrieves the graded results and score summary for an attempt.
     *
     * @param attemptId the UUID of the attempt.
     * @param username  the username of the user requesting the result.
     * @param isStaff   whether the requester has instructor/admin privileges.
     * @return the {@link AttemptResultResponse}.
     */
    AttemptResultResponse getAttemptResult(UUID attemptId, String username, boolean isStaff);

    /**
     * Retrieves active attempt data by ID to restore session on page reload.
     *
     * @param attemptId the UUID of the attempt.
     * @param username  the username of the student.
     * @param isStaff   whether the requester has instructor/admin privileges.
     * @return the {@link StartAttemptResponse}.
     */
    StartAttemptResponse getAttemptById(UUID attemptId, String username, boolean isStaff);

    /**
     * Retrieves full attempt review details, including selected answers, correct answers, and explanations.
     *
     * @param attemptId the UUID of the attempt.
     * @param username  the username of the user.
     * @param isStaff   whether the requester has instructor/admin privileges.
     * @return the {@link QuizAttemptReviewResponse}.
     */
    QuizAttemptReviewResponse getAttemptReview(UUID attemptId, String username, boolean isStaff);

    /**
     * Retrieves all attempt history of a student for a specific assignment.
     *
     * @param assignmentId the UUID of the assignment.
     * @param username     the username of the student.
     * @return a list of {@link SubmitAttemptResponse} history records.
     */
    List<SubmitAttemptResponse> getStudentAttemptHistory(UUID assignmentId, String username);
}
