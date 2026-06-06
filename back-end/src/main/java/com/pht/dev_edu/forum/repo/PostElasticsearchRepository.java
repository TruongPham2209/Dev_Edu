package com.pht.dev_edu.forum.repo;

import java.util.List;
import java.util.UUID;

public interface PostElasticsearchRepository {
    void syncAllToElasticsearch();
    
    SearchResult search(String keyword, List<UUID> userInteractedPostIds, int offset, int limit);
    
    SearchResult getFeed(List<UUID> userInteractedPostIds, int offset, int limit);
    
    SearchResult getRelated(UUID postId, int limit);

    SearchResult getGlobalRecommendations(int limit);
}
