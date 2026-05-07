package com.pht.dev_edu.assignment.service;

import java.util.Set;
import java.util.UUID;

public interface AssignmentPermissionService {
    void checkViewAssignmentPermissionByLecture(Set<String> authorities, String actor, UUID lectureId);

    void checkViewAssignmentPermissionByAssignment(Set<String> authorities, String actor, UUID assignmentId);

    void checkModifyAssignmentPermission(Set<String> authorities, String actor, UUID assignmentId);

    void checkModifyAssignmentPermissionByLecture(Set<String> authorities, String actor, UUID lectureId);
}
