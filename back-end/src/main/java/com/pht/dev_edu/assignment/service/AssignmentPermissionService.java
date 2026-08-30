package com.pht.dev_edu.assignment.service;

import java.util.Set;
import java.util.UUID;

/**
 * Service for checking and validating permissions on assignments.
 */
public interface AssignmentPermissionService {

    /**
     * Checks if the user has permission to view assignments in a specific lecture.
     *
     * @param authorities the authorities/roles of the current user (e.g., ADMIN, LECTURER, STUDENT).
     * @param actor       the username of the user performing the action.
     * @param lectureId   the UUID of the lecture containing the assignments.
     */
    void checkViewAssignmentPermissionByLecture(Set<String> authorities, String actor, UUID lectureId);

    /**
     * Checks if the user has permission to view details of a specific assignment.
     *
     * @param authorities  the authorities/roles of the current user.
     * @param actor        the username of the user performing the action.
     * @param assignmentId the UUID of the assignment to view.
     */
    void checkViewAssignmentPermissionByAssignment(Set<String> authorities, String actor, UUID assignmentId);

    /**
     * Checks if the user has permission to modify or delete a specific assignment.
     *
     * @param authorities  the authorities/roles of the current user.
     * @param actor        the username of the user performing the action.
     * @param assignmentId the UUID of the assignment to modify.
     */
    void checkModifyAssignmentPermission(Set<String> authorities, String actor, UUID assignmentId);

    /**
     * Checks if the user has permission to create an assignment within a specific lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user performing the action.
     * @param lectureId   the UUID of the lecture where the assignment will be created.
     */
    void checkModifyAssignmentPermissionByLecture(Set<String> authorities, String actor, UUID lectureId);
}
