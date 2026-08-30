package com.pht.dev_edu.assignment.service;

import com.pht.dev_edu.assignment.dto.AssignmentRequest;
import com.pht.dev_edu.assignment.dto.AssignmentResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service for managing assignment CRUD operations.
 */
public interface AssignmentService {

    /**
     * Retrieves the detail of a specific assignment by ID.
     *
     * @param authorities  the authorities/roles of the current user.
     * @param actor        the username of the user requesting the detail.
     * @param assignmentId the UUID of the assignment.
     * @return the {@link AssignmentResponse} containing detailed assignment data.
     */
    AssignmentResponse getAssignmentDetail(Set<String> authorities, String actor, UUID assignmentId);

    /**
     * Retrieves a list of all assignments belonging to a specific lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user requesting the assignments.
     * @param lectureId   the UUID of the lecture.
     * @return a list of {@link AssignmentResponse} objects.
     */
    List<AssignmentResponse> getAssignments(Set<String> authorities, String actor, UUID lectureId);

    /**
     * Creates a new assignment for a lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param author      the username of the creator (lecturer/admin).
     * @param req         the {@link AssignmentRequest} DTO containing assignment parameters.
     * @return the created {@link AssignmentResponse}.
     */
    AssignmentResponse create(Set<String> authorities, String author, AssignmentRequest req);

    /**
     * Soft-deletes an assignment by ID (with permission check).
     *
     * @param authorities  the authorities/roles of the current user.
     * @param actor        the username of the user requesting the deletion.
     * @param assignmentId the UUID of the assignment to delete.
     */
    void delete(Set<String> authorities, String actor, UUID assignmentId);

    /**
     * Permanently deletes an assignment by ID (used for scheduled cleanup jobs).
     *
     * @param assignmentId the UUID of the assignment to permanently delete.
     */
    void deleteById(UUID assignmentId);

    /**
     * Permanently deletes multiple assignments by their IDs.
     *
     * @param assignmentIds the list of assignment UUIDs to delete.
     */
    void deleteByIds(List<UUID> assignmentIds);
}
