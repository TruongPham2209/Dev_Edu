package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.*;
import com.pht.dev_edu.forum.entity.PostEntity;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service for managing forum posts, post versions, publication workflows, and moderation.
 */
public interface PostService {

    /**
     * Retrieves post versions filtered by review status with cursor-based pagination.
     *
     * @param status     the {@link PostStatus} filter (DRAFT, PENDING, PUBLISHED, REJECTED).
     * @param lastCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link PostResponse} items.
     */
    CustomPaging<PostResponse> getPostVersions(PostStatus status, String lastCursor);

    /**
     * Retrieves posts authored by a specific user filtered by status.
     *
     * @param username   the username of the author.
     * @param status     the {@link PostStatus} filter.
     * @param lastCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link PostResponse} items.
     */
    CustomPaging<PostResponse> getPostedPosts(String username, PostStatus status, String lastCursor);

    /**
     * Retrieves all version history of a specific post.
     *
     * @param authorities the authorities/roles of the current user.
     * @param actor       the username of the user requesting versions.
     * @param postId      the UUID of the post.
     * @param status      the {@link PostStatus} filter (optional).
     * @return a list of {@link PostResponse} version records.
     */
    List<PostResponse> getPostVersionsByPostId(Set<String> authorities, String actor, UUID postId, PostStatus status);

    /**
     * Retrieves detailed information of a published post for viewing.
     *
     * @param actor  the username of the viewer (can be null for anonymous readers).
     * @param postId the UUID of the post.
     * @return the {@link PostResponse} containing full post details.
     */
    PostResponse getPostDetail(String actor, UUID postId);

    /**
     * Creates a new forum post and its initial post version.
     *
     * @param author      the username of the post creator.
     * @param postRequest the {@link PostRequest} containing title, description, HTML content, thumbnail, and tags.
     * @return the created {@link PostVersionResponse}.
     */
    PostVersionResponse create(String author, PostRequest postRequest);

    /**
     * Updates an existing forum post (creates a new version or updates draft).
     *
     * @param author      the username of the post author.
     * @param postRequest the {@link PostRequest} containing updated data.
     * @return the updated {@link PostVersionResponse}.
     */
    PostVersionResponse update(String author, PostRequest postRequest);

    /**
     * Deletes a specific version of a post.
     *
     * @param authorities   the authorities/roles of the current user.
     * @param author        the username of the user requesting deletion.
     * @param postVersionId the UUID of the post version to delete.
     */
    void deletePostVersion(Set<String> authorities, String author, UUID postVersionId);

    /**
     * Deletes an entire forum post and all its versions.
     *
     * @param authorities the authorities/roles of the current user.
     * @param author      the username of the user requesting deletion.
     * @param postId      the UUID of the post to delete.
     */
    void deletePost(Set<String> authorities, String author, UUID postId);

    /**
     * Updates the status of a post version (e.g., approving or rejecting a submitted post).
     *
     * @param actor         the username of the moderator or administrator.
     * @param postStatus    the new {@link PostStatus} to apply.
     * @param postVersionId the UUID of the post version.
     * @return the {@link UpdatePostVersionResult} containing update results.
     */
    UpdatePostVersionResult updatePostVersion(String actor, PostStatus postStatus, UUID postVersionId);

    /**
     * Retrieves a post entity by ID (for internal service lookups).
     *
     * @param postId the UUID of the post.
     * @return the {@link PostEntity}.
     */
    PostEntity getPostById(UUID postId);
}
