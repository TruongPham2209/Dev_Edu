package com.pht.dev_edu.forum.controller;

import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.forum.dto.CommentRequest;
import com.pht.dev_edu.forum.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("ForumCommentController")
@RequestMapping("/api/v1/forum/comments")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CommentController {
    CommentService commentService;

    @PreAuthorize("permitAll()")
    @GetMapping
    public ResponseEntity<?> getRootComments(
            @RequestParam UUID postId,
            @RequestParam(required = false) String nextCursor
    ) {
        var username = SecurityContextUtils.getCurrentUsername();
        var comments = commentService.getCommentsByPostId(username, postId, nextCursor);
        return ApiUtils.buildSuccessResponse(comments);
    }

    @PreAuthorize("permitAll()")
    @GetMapping("/replies")
    public ResponseEntity<?> getRepliedComments(
            @RequestParam UUID parentCommentId,
            @RequestParam(required = false) String nextCursor
    ) {
        var username = SecurityContextUtils.getCurrentUsername();
        var comments = commentService.getRepliedComments(username, parentCommentId, nextCursor);
        return ApiUtils.buildSuccessResponse(comments);
    }

    @PostMapping
    public ResponseEntity<?> createComment(
            @RequestBody @Valid CommentRequest request
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var createdComment = commentService.createComment(username, request);
        return ApiUtils.buildSuccessResponse(createdComment);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteComment(
            @RequestParam UUID commentId
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        commentService.deleteComment(authorities, username, commentId);
        return ApiUtils.buildSuccessResponse("Comment deleted successfully.");
    }
}
