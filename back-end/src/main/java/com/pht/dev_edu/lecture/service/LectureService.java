package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.lecture.dto.LectureRequest;
import com.pht.dev_edu.lecture.dto.LectureResponse;
import com.pht.dev_edu.lecture.entity.LectureEntity;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service for managing video lectures, ordering, and lecture details.
 */
public interface LectureService {

    /**
     * Retrieves all lectures belonging to a specific course.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the viewing user.
     * @param courseId    the UUID of the course.
     * @return a list of {@link LectureResponse} items.
     */
    List<LectureResponse> getLecturesByCourse(Set<String> authorities, String actor, UUID courseId);

    /**
     * Retrieves detailed information of a specific lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the viewing user.
     * @param lectureId   the UUID of the lecture.
     * @return the {@link LectureResponse} containing lecture details.
     */
    LectureResponse getLecture(Set<String> authorities, String actor, UUID lectureId);

    /**
     * Retrieves a lecture entity by ID (internal use).
     *
     * @param lectureId the UUID of the lecture.
     * @return the {@link LectureEntity}.
     */
    LectureEntity getLectureById(UUID lectureId);

    /**
     * Creates a new lecture within a course.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user creating the lecture.
     * @param req         the {@link LectureRequest} containing title, display order, video object key, and course ID.
     * @return the created {@link LectureResponse}.
     */
    LectureResponse createLecture(Set<String> authorities, String actor, LectureRequest req);

    /**
     * Updates an existing lecture's details.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user updating the lecture.
     * @param req         the {@link LectureRequest} containing updated data.
     * @return the updated {@link LectureResponse}.
     */
    LectureResponse updateLecture(Set<String> authorities, String actor, LectureRequest req);

    /**
     * Soft-deletes a lecture by ID.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user requesting deletion.
     * @param lectureId   the UUID of the lecture to delete.
     */
    void deleteLecture(Set<String> authorities, String actor, UUID lectureId);

    /**
     * Permanently deletes a lecture by ID (used for scheduled cleanup jobs).
     *
     * @param lectureId the UUID of the lecture to permanently delete.
     */
    void deleteById(UUID lectureId);
}
