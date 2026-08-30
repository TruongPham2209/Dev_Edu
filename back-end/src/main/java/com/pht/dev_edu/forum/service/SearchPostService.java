package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.PostResponse;

import java.util.List;
import java.util.UUID;

/**
 * Service for querying news feeds, searching posts via Elasticsearch, and finding related posts.
 */
public interface SearchPostService {

    /**
     * Retrieves the forum news feed for a user with cursor pagination.
     *
     * @param username   the username of the viewing user (optional).
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link PostResponse} items.
     */
    CustomPaging<PostResponse> getPostsInFeed(String username, String nextCursor);

    /**
     * Searches posts using full-text keyword search in Elasticsearch.
     *
     * @param username   the username of the searching user.
     * @param keyword    the search keyword string.
     * @param nextCursor the cursor token for pagination.
     * @return a {@link CustomPaging} of {@link PostResponse} items.
     */
    CustomPaging<PostResponse> searchPosts(String username, String keyword, String nextCursor);

    /**
     * Retrieves related posts based on topic and content similarity.
     *
     * @param postId the UUID of the source post.
     * @return a list of related {@link PostResponse} items.
     */
    List<PostResponse> getRelatedPosts(UUID postId);
}
