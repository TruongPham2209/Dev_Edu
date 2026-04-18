package com.pht.dev_edu.forum.controller;

import com.pht.dev_edu.forum.service.PostService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController("PostController")
@RequestMapping("/api/v1/forum/posts")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostController {
    PostService postService;
}
