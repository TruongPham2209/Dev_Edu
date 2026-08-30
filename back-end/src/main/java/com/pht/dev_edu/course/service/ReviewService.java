package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.ReviewRequest;
import com.pht.dev_edu.course.dto.ReviewResponse;

import java.util.Set;
import java.util.UUID;

/**
 * Service for managing course ratings and reviews from enrolled students.
 */
public interface ReviewService {

    /**
     * Creates or updates a student review for an enrolled course.
     *
     * @param username the username of the reviewing student.
     * @param request  the {@link ReviewRequest} containing course ID, rating score (1-5), and review text.
     * @return the created {@link ReviewResponse}.
     */
    ReviewResponse createReview(String username, ReviewRequest request);

    /**
     * Retrieves the current user's review for a specific course.
     *
     * @param courseId the UUID of the course.
     * @param username the username of the user.
     * @return the {@link ReviewResponse} if reviewed, or null otherwise.
     */
    ReviewResponse getMyReview(UUID courseId, String username);

    /**
     * Deletes a course review (owner or administrator).
     *
     * @param authorities the authorities/roles of the current user.
     * @param username    the username of the user requesting deletion.
     * @param reviewId    the UUID of the review to delete.
     */
    void deleteReview(Set<String> authorities, String username, UUID reviewId);

    /**
     * Retrieves paginated reviews for a course using cursor-based pagination.
     *
     * @param username   the username of the current user (if logged in).
     * @param courseId   the UUID of the course.
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link ReviewResponse} items.
     */
    CustomPaging<ReviewResponse> getReviewsByCourse(String username, UUID courseId, String nextCursor);
}
