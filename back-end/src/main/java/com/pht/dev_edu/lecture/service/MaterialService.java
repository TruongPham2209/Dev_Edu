package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.lecture.dto.MaterialRequest;
import com.pht.dev_edu.lecture.dto.MaterialResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service for managing supplementary learning materials and attached files in lectures.
 */
public interface MaterialService {

    /**
     * Retrieves all supplementary materials attached to a lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the viewing user.
     * @param lectureId   the UUID of the lecture.
     * @return a list of {@link MaterialResponse} items.
     */
    List<MaterialResponse> getMaterialsByLecture(Set<String> authorities, String actor, UUID lectureId);

    /**
     * Attaches a new learning material to a lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user creating the material.
     * @param req         the {@link MaterialRequest} containing lecture ID, title, material type, and object key.
     * @return the created {@link MaterialResponse}.
     */
    MaterialResponse create(Set<String> authorities, String actor, MaterialRequest req);

    /**
     * Deletes a learning material attachment from a lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user requesting deletion.
     * @param materialId  the UUID of the material to delete.
     */
    void delete(Set<String> authorities, String actor, UUID materialId);
}
