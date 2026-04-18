package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.PostRequest;
import com.pht.dev_edu.forum.dto.PostStatus;
import com.pht.dev_edu.forum.dto.PostVersionResponse;
import com.pht.dev_edu.forum.dto.UpdatePostVersionResult;

import java.util.List;
import java.util.Set;
import java.util.UUID;

public interface PostService {
    CustomPaging<PostVersionResponse> getPostVersions(PostStatus status, String lastCursor);

    List<PostVersionResponse> getPostVersionsByPostId(Set<String> authorities, String actor, UUID postId);

    PostVersionResponse create(String author, PostRequest postRequest);

    PostVersionResponse update(String author, PostRequest postRequest);

    void deletePostVersion(Set<String> authorities, String author, UUID postVersionId);

    void deletePost(Set<String> authorities, String author, UUID postId);

    UpdatePostVersionResult updatePostVersion(String actor, PostStatus postStatus, UUID postVersionId);
}
