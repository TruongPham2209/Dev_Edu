package com.pht.dev_edu.tracking.service;

import com.pht.dev_edu.assignment.dto.SubmissionEvent;
import com.pht.dev_edu.assignment.dto.SubmissionLogResponse;
import com.pht.dev_edu.common.dto.CustomPaging;

import java.util.Set;
import java.util.UUID;

/**
 * Service for recording and querying student assignment submission logs and audit history.
 */
public interface SubmissionService {

    /**
     * Retrieves paginated submission audit history logs for a student on an assignment.
     *
     * @param authorities     the authorities/roles of the current user.
     * @param actor           the username of the viewing user.
     * @param studentUsername the username of the student.
     * @param assignmentId    the UUID of the assignment.
     * @param page            the 0-indexed page number.
     * @return a {@link CustomPaging} of {@link SubmissionLogResponse} items.
     */
    CustomPaging<SubmissionLogResponse> getSubmissionLogsByAssignmentIdForStudent(Set<String> authorities, String actor, String studentUsername, UUID assignmentId, int page);

    /**
     * Saves an assignment submission event received from Kafka into the database.
     *
     * @param submissionEvent the {@link SubmissionEvent} payload.
     */
    void saveSubmissionLog(SubmissionEvent submissionEvent);
}
