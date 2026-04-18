package com.pht.dev_edu.lecture.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtil;
import com.pht.dev_edu.common.util.SecurityContextUtil;
import com.pht.dev_edu.lecture.dto.CommentPageRequest;
import com.pht.dev_edu.lecture.dto.CommentRequest;
import com.pht.dev_edu.lecture.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;

@RestController("LectureCommentController")
@RequestMapping("/api/v1/lectures/comments")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CommentController {
    CommentService lectureCommentService;

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse> getComments(
            @RequestBody @Valid CommentPageRequest req
    ) {
        req.setDefaultPage();

        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();

        var comments = lectureCommentService.getComments(authorities, username, req);
        return ApiUtil.buildSuccessResponse(comments);
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createComment(@RequestBody CommentRequest req) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        var comment = lectureCommentService.create(authorities, username, req);
        return ApiUtil.buildSuccessResponse(comment);
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse> deleteComment(@RequestParam UUID commentId) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        Set<String> authorities = SecurityContextUtil.getCurrentUserAuthorities();
        lectureCommentService.delete(authorities, username, commentId);
        return ApiUtil.buildSuccessResponse("Comment deleted successfully");
    }
}
