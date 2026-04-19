package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.AssignmentResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface AssignmentService {
    List<AssignmentResponse> getAssignments(Set<String> authorities, String actor, UUID lectureId);

    AssignmentResponse create(Set<String> authorities, String author, AssignmentRequest req);

    void delete(Set<String> authorities, String actor, UUID assignmentId);

    void deleteById(UUID assignmentId);

    void deleteByIds(List<UUID> assignmentIds);
}
