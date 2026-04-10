package com.pht.dev_edu.lecture.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.lecture.dto.CommentRequest;
import com.pht.dev_edu.lecture.dto.CommentResponse;

import java.util.Set;
import java.util.UUID;

public interface CommentService {
    CustomPaging<CommentResponse> getComments(Set<String> authorities, String actor, UUID lectureId, int page, int size);

    CustomPaging<CommentResponse> getCommentsByParent(Set<String> authorities, String actor, UUID lectureId, UUID parentCommentId, int page, int size);

    CommentResponse create(Set<String> authorities, String author, CommentRequest req);

    void delete(Set<String> authorities, String actor, UUID commentId);
}
