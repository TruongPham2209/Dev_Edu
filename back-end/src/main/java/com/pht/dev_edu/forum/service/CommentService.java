package com.pht.dev_edu.forum.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.forum.dto.CommentRequest;
import com.pht.dev_edu.forum.dto.CommentResponse;

import java.util.Set;
import java.util.UUID;

public interface CommentService {
    CommentResponse createComment(String username, CommentRequest request);

    CustomPaging<CommentResponse> getCommentsByPostId(UUID postId, String nextCursor);

    CustomPaging<CommentResponse> getRepliedComments(UUID parentCommentId, String nextCursor);

    void deleteComment(Set<String> authorities, String username, UUID commentId);
}
