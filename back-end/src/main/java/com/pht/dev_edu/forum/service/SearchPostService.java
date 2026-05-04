package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.PostResponse;

import java.util.List;
import java.util.UUID;

public interface SearchPostService {
    CustomPaging<PostResponse> getPostsInFeed(String username, String nextCursor);

    CustomPaging<PostResponse> searchPosts(String username, String keyword, String nextCursor);

    List<PostResponse> getRelatedPosts(UUID postId);
}
