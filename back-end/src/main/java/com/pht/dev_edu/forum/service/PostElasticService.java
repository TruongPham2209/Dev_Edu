package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.forum.document.PostDocument;
import com.pht.dev_edu.forum.dto.PostInteractiveData;

import java.util.UUID;

public interface PostElasticService {
    void upsertPostContent(PostDocument document);

    void deletePost(UUID postId);

    void updateInteractiveData(PostInteractiveData  interactiveData);
}
