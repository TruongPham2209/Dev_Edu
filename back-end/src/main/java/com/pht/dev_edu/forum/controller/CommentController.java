package com.pht.dev_edu.forum.controller;

import com.pht.dev_edu.forum.service.CommentService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("ForumCommentController")
@RequestMapping("/api/v1/forum/comments")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CommentController {
    CommentService commentService;

    // TODO: Implement endpoints
}
