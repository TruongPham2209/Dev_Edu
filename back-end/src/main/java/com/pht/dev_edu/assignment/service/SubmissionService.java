package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.SubmissionRequest;
import com.pht.dev_edu.assignment.dto.SubmissionResponse;
import com.pht.dev_edu.common.dto.CustomPaging;

import java.util.Set;
import java.util.UUID;

/**
 * Service for managing assignment submissions by students.
 */
public interface SubmissionService {

    /**
     * Retrieves paginated submissions for a specific assignment.
     *
     * @param authorities  the authorities/roles of the current user (lecturer/admin).
     * @param actor        the username of the user requesting submissions.
     * @param assignmentId the UUID of the assignment.
     * @param page         the 0-indexed page number.
     * @param size         the page size.
     * @return a {@link CustomPaging} of {@link SubmissionResponse} items.
     */
    CustomPaging<SubmissionResponse> getSubmissionsByAssignment(Set<String> authorities, String actor, UUID assignmentId, int page, int size);

    /**
     * Submits an assignment on behalf of a student.
     *
     * @param studentUsername the username of the submitting student.
     * @param req             the {@link SubmissionRequest} containing assignment ID, attached file, and notes.
     * @return the saved {@link SubmissionResponse}.
     */
    SubmissionResponse submit(String studentUsername, SubmissionRequest req);

    /**
     * Cancels / un-submits an assignment submission prior to deadline.
     *
     * @param studentUsername the username of the student requesting un-submission.
     * @param assignmentId    the UUID of the assignment.
     */
    void unSubmit(String studentUsername, UUID assignmentId);
}
