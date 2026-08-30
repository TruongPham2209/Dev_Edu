package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.lecture.dto.ProgressResponse;
import com.pht.dev_edu.lecture.dto.ProgressSegmentRequest;

/**
 * Service for tracking student watch progress and lecture completion.
 */
public interface ProgressService {

    /**
     * Updates the watched time segment for a video lecture and calculates completion percentage.
     *
     * @param actor the username of the student watching the lecture.
     * @param req   the {@link ProgressSegmentRequest} containing lecture ID and start/end time segment.
     * @return the {@link ProgressResponse} containing updated completion status and percentage.
     */
    ProgressResponse updateProgress(String actor, ProgressSegmentRequest req);
}
