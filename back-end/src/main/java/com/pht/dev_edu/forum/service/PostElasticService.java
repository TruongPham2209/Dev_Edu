package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.forum.document.PostDocument;
import com.pht.dev_edu.forum.dto.PostInteractiveData;

import java.util.UUID;

/**
 * Service for synchronizing forum post documents and search indexes in Elasticsearch.
 */
public interface PostElasticService {

    /**
     * Creates or updates a forum post document in the Elasticsearch index.
     *
     * @param document the {@link PostDocument} containing post title, description, content, author, and tags.
     */
    void upsertPostContent(PostDocument document);

    /**
     * Removes a post index from Elasticsearch upon deletion.
     *
     * @param postId the UUID of the post to remove.
     */
    void deletePost(UUID postId);

    /**
     * Updates interactive metrics (likes, views, comment counts) for a post in Elasticsearch.
     *
     * @param interactiveData the {@link PostInteractiveData} containing updated interaction counters.
     */
    void updateInteractiveData(PostInteractiveData interactiveData);
}
