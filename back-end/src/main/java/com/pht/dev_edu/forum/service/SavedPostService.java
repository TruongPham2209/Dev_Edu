package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.SavedPostResponse;

import java.util.UUID;

/**
 * Service for managing bookmarked / saved forum posts for users.
 */
public interface SavedPostService {

    /**
     * Saves a forum post to the user's bookmarked collection.
     *
     * @param username the username of the user.
     * @param postId   the UUID of the post to save.
     */
    void savePost(String username, UUID postId);

    /**
     * Removes a forum post from the user's bookmarked collection.
     *
     * @param username the username of the user.
     * @param postId   the UUID of the post to un-save.
     */
    void unSavePost(String username, UUID postId);

    /**
     * Retrieves the user's saved posts with cursor-based pagination.
     *
     * @param username   the username of the user.
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link SavedPostResponse} items.
     */
    CustomPaging<SavedPostResponse> getSavedPosts(String username, String nextCursor);
}
