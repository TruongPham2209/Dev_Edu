package com.pht.dev_edu.tracking.service;

import com.pht.dev_edu.assignment.dto.SubmissionEvent;
import com.pht.dev_edu.assignment.dto.SubmissionLogResponse;
import com.pht.dev_edu.common.dto.CustomPaging;

import java.util.Set;
import java.util.UUID;

public interface SubmissionService {
    CustomPaging<SubmissionLogResponse> getSubmissionLogsByAssignmentIdForStudent(Set<String> authorities, String actor, String studentUsername, UUID assignmentId, int page);

    void saveSubmissionLog(SubmissionEvent submissionEvent);
}
