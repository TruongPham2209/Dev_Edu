package com.pht.dev_edu.lecture.service;

import java.util.Set;
import java.util.UUID;

/**
 * Service for checking permissions on lectures and course content.
 */
public interface LecturePermissionService {

    /**
     * Checks if the user has permission to view a specific lecture (must be admin, assigned lecturer, or enrolled student).
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user performing the action.
     * @param lectureId   the UUID of the lecture.
     */
    void checkViewPermissionByLecture(Set<String> authorities, String actor, UUID lectureId);

    /**
     * Checks if the user has permission to modify or delete a specific lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user performing the action.
     * @param lectureId   the UUID of the lecture.
     */
    void checkModifyPermissionByLecture(Set<String> authorities, String actor, UUID lectureId);

    /**
     * Checks if the user has permission to modify lectures within a specific course.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user performing the action.
     * @param courseId    the UUID of the course.
     */
    void checkModifyPermissionByCourse(Set<String> authorities, String actor, UUID courseId);

    /**
     * Checks if the user has permission to view lectures within a specific course.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user performing the action.
     * @param courseId    the UUID of the course.
     */
    void checkViewPermissionByCourse(Set<String> authorities, String actor, UUID courseId);
}
