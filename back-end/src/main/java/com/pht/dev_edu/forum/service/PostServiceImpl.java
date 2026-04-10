package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.PostRequest;
import com.pht.dev_edu.forum.dto.PostResponse;
import com.pht.dev_edu.forum.dto.PostStatus;
import com.pht.dev_edu.forum.dto.PostVersionResponse;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostServiceImpl implements PostService {
    @Override
    public CustomPaging<PostResponse> getPosts(UUID lastPostId) {
        return null;
    }

    @Override
    public CustomPaging<PostResponse> searchPosts(String keyword, UUID lastPostId) {
        return null;
    }

    @Override
    public CustomPaging<PostVersionResponse> getPostVersions(PostStatus status, UUID lastPostVersionId) {
        return null;
    }

    @Override
    public List<PostVersionResponse> getPostVersionsByPostId(UUID postId, boolean isAdmin) {
        return List.of();
    }

    @Override
    public PostVersionResponse create(String author, PostRequest postRequest) {
        return null;
    }

    @Override
    public PostVersionResponse update(String author, PostRequest postRequest) {
        return null;
    }

    @Override
    public void deletePostVersion(String author, UUID postVersionId) {

    }

    @Override
    public void deletePost(String author, UUID postId) {

    }

    @Override
    public PostVersionResponse updatePostVersion(String actor, PostStatus postStatus, UUID postVersionId) {
        return null;
    }
}
