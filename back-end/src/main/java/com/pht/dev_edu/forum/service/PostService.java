package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.PostRequest;
import com.pht.dev_edu.forum.dto.PostResponse;
import com.pht.dev_edu.forum.dto.PostStatus;
import com.pht.dev_edu.forum.dto.PostVersionResponse;

import java.util.List;
import java.util.UUID;

public interface PostService {
    CustomPaging<PostResponse> getPosts(UUID lastPostId);

    CustomPaging<PostResponse> searchPosts(String keyword, UUID lastPostId);

    CustomPaging<PostVersionResponse> getPostVersions(PostStatus status, UUID lastPostVersionId);

    List<PostVersionResponse> getPostVersionsByPostId(UUID postId, boolean isAdmin);

    PostVersionResponse create(String author, PostRequest postRequest);

    PostVersionResponse update(String author, PostRequest postRequest);

    void deletePostVersion(String author, UUID postVersionId);

    void deletePost(String author, UUID postId);

    PostVersionResponse updatePostVersion(String actor, PostStatus postStatus, UUID postVersionId);
}
