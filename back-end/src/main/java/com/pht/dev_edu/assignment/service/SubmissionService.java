package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.SubmissionRequest;
import com.pht.dev_edu.assignment.dto.SubmissionResponse;
import com.pht.dev_edu.common.dto.CustomPaging;

import java.util.Set;
import java.util.UUID;

public interface SubmissionService {
    CustomPaging<SubmissionResponse> getSubmissionsByAssignment(Set<String> authorities, String actor, UUID assignmentId, int page, int size);

    SubmissionResponse submit(String studentUsername, SubmissionRequest req);

    void unSubmit(String studentUsername, UUID submissionId);
}
