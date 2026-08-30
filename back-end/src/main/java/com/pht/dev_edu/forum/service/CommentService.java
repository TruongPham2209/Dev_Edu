package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.CommentRequest;
import com.pht.dev_edu.forum.dto.CommentResponse;

import java.util.Set;
import java.util.UUID;

/**
 * Service for managing forum post comments and nested replies.
 */
public interface CommentService {

    /**
     * Creates a new root comment or reply on a forum post.
     *
     * @param username the username of the comment author.
     * @param request  the {@link CommentRequest} containing post ID, optional parent comment ID, and content.
     * @return the created {@link CommentResponse}.
     */
    CommentResponse createComment(String username, CommentRequest request);

    /**
     * Retrieves root comments for a post using cursor-based pagination.
     *
     * @param username   the username of the viewing user.
     * @param postId     the UUID of the forum post.
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link CommentResponse} items.
     */
    CustomPaging<CommentResponse> getCommentsByPostId(String username, UUID postId, String nextCursor);

    /**
     * Retrieves child replies for a specific parent comment.
     *
     * @param username        the username of the viewing user.
     * @param parentCommentId the UUID of the parent comment.
     * @param nextCursor      the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link CommentResponse} items.
     */
    CustomPaging<CommentResponse> getRepliedComments(String username, UUID parentCommentId, String nextCursor);

    /**
     * Deletes a forum comment (author, moderator, or admin).
     *
     * @param authorities the authorities/roles of the current user.
     * @param username    the username of the user requesting deletion.
     * @param commentId   the UUID of the comment to delete.
     */
    void deleteComment(Set<String> authorities, String username, UUID commentId);
}
