package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.SavedPostResponse;

import java.util.UUID;

public interface SavedPostService {
    void savePost(String username, UUID postId);

    void unSavePost(String username, UUID postId);

    CustomPaging<SavedPostResponse> getSavedPosts(String username, String nextCursor);
}
