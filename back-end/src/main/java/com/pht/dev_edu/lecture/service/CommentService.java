package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.lecture.dto.CommentPageRequest;
import com.pht.dev_edu.lecture.dto.CommentRequest;
import com.pht.dev_edu.lecture.dto.CommentResponse;

import java.util.Set;
import java.util.UUID;

/**
 * Service for managing questions and comments on lecture videos.
 */
public interface CommentService {

    /**
     * Retrieves paginated comments for a specific lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the viewing user.
     * @param req         the {@link CommentPageRequest} containing lecture ID and pagination settings.
     * @return a {@link CustomPaging} of {@link CommentResponse} items.
     */
    CustomPaging<CommentResponse> getComments(Set<String> authorities, String actor, CommentPageRequest req);

    /**
     * Creates a new comment or reply within a lecture.
     *
     * @param authorities the authorities/roles of the current user.
     * @param author      the username of the comment author.
     * @param req         the {@link CommentRequest} containing lecture ID, optional parent ID, and content.
     * @return the created {@link CommentResponse}.
     */
    CommentResponse create(Set<String> authorities, String author, CommentRequest req);

    /**
     * Deletes a lecture comment.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user requesting deletion.
     * @param commentId   the UUID of the comment to delete.
     */
    void delete(Set<String> authorities, String actor, UUID commentId);
}
