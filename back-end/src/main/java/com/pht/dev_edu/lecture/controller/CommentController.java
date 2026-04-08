package com.pht.dev_edu.lecture.controller;

import com.pht.dev_edu.common.dto.ApiResponse;
import com.pht.dev_edu.common.util.ApiUtil;
import com.pht.dev_edu.common.util.SecurityContextUtil;
import com.pht.dev_edu.lecture.dto.CommentRequest;
import com.pht.dev_edu.lecture.service.LectureCommentService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("LectureCommentController")
@RequestMapping("/api/v1/lectures/comments")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CommentController {
    LectureCommentService lectureCommentService;

    @GetMapping("/")
    public ResponseEntity<ApiResponse> getComments(
            @RequestParam UUID lectureId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        var comments = lectureCommentService.getComments(username, lectureId, page, size);
        return ApiUtil.buildSuccessResponse(comments);
    }

    @GetMapping("/parent")
    public ResponseEntity<ApiResponse> getCommentsByParent(
            @RequestParam UUID lectureId,
            @RequestParam UUID parentCommentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        var comments = lectureCommentService.getCommentsByParent(username, lectureId, parentCommentId, page, size);
        return ApiUtil.buildSuccessResponse(comments);
    }

    @PostMapping("/")
    public ResponseEntity<ApiResponse> createComment(@RequestBody CommentRequest req) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        var comment = lectureCommentService.create(username, req);
        return ApiUtil.buildSuccessResponse(comment);
    }

    @DeleteMapping("/")
    public ResponseEntity<ApiResponse> deleteComment(@RequestParam UUID commentId) {
        String username = SecurityContextUtil.getCurrentUsernameForController();
        lectureCommentService.delete(username, commentId);
        return ApiUtil.buildSuccessResponse("Comment deleted successfully");
    }
}
