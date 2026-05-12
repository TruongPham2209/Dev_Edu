package com.pht.dev_edu.forum.controller;

import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.common.validation.CreateValidation;
import com.pht.dev_edu.common.validation.UpdateValidation;
import com.pht.dev_edu.forum.dto.PostRequest;
import com.pht.dev_edu.forum.dto.PostStatus;
import com.pht.dev_edu.forum.service.PostService;
import com.pht.dev_edu.forum.service.SavedPostService;
import com.pht.dev_edu.forum.service.SearchPostService;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController("PostController")
@RequestMapping("/api/v1/forum/posts")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PostController {
    PostService postService;
    SavedPostService savedPostService;
    SearchPostService searchPostService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/versions")
    public ResponseEntity<?> getAllVersions(
            @RequestParam PostStatus status,
            @RequestParam(required = false) String lastCursor
    ) {
        var versions = postService.getPostVersions(status, lastCursor);
        return ApiUtils.buildSuccessResponse(versions);
    }

    @GetMapping("/versions/{postId}")
    public ResponseEntity<?> getVersionsByPostId(
            @PathVariable UUID postId,
            @RequestParam(required = false, defaultValue = "APPROVED") PostStatus status
    ) {
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        var username = SecurityContextUtils.getCurrentUsername();

        var versions = postService.getPostVersionsByPostId(authorities, username, postId, status);
        return ApiUtils.buildSuccessResponse(versions);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/versions")
    public ResponseEntity<?> updatePostVersionStatus(
            @RequestBody Map<String, Object> requestBody
    ) {
        var postVersionIdObj = requestBody.get("postVersionId");
        var postStatusObj = requestBody.get("postStatus");
        if (postVersionIdObj == null || postStatusObj == null) {
            throw new BadRequestException("postVersionId and postStatus are required");
        }
        var postVersionId = UUID.fromString((String) postVersionIdObj);
        var postStatus = PostStatus.valueOf((String) postStatusObj);

        var username = SecurityContextUtils.getCurrentUsernameForController();

        var result = postService.updatePostVersion(username, postStatus, postVersionId);
        return ApiUtils.buildSuccessResponse(result);
    }

    @DeleteMapping("/versions")
    public ResponseEntity<?> deletePostVersion(
            @RequestParam UUID postVersionId
    ) {
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        var username = SecurityContextUtils.getCurrentUsernameForController();

        postService.deletePostVersion(authorities, username, postVersionId);
        return ApiUtils.buildSuccessResponse("Post version deleted successfully");
    }

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestBody @Validated({CreateValidation.class}) PostRequest postRequest
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var createdPost = postService.create(username, postRequest);
        return ApiUtils.buildSuccessResponse(createdPost);
    }

    @PutMapping
    public ResponseEntity<?> updatePost(
            @RequestBody @Validated({UpdateValidation.class}) PostRequest postRequest
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var updatedPost = postService.update(username, postRequest);
        return ApiUtils.buildSuccessResponse(updatedPost);
    }

    @DeleteMapping
    public ResponseEntity<?> deletePost(
            @RequestParam UUID postId
    ) {
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        var username = SecurityContextUtils.getCurrentUsernameForController();

        postService.deletePost(authorities, username, postId);
        return ApiUtils.buildSuccessResponse("Post deleted successfully");
    }

    @GetMapping("/saved")
    public ResponseEntity<?> getSavedPosts(
            @RequestParam(required = false) String nextCursor
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var savedPosts = savedPostService.getSavedPosts(username, nextCursor);
        return ApiUtils.buildSuccessResponse(savedPosts);
    }

    @PostMapping("/{postId}/save")
    public ResponseEntity<?> savePost(
            @PathVariable UUID postId
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        savedPostService.savePost(username, postId);
        return ApiUtils.buildSuccessResponse("Post saved successfully");
    }

    @DeleteMapping("/{postId}/save")
    public ResponseEntity<?> unSavePost(
            @PathVariable UUID postId
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        savedPostService.unSavePost(username, postId);
        return ApiUtils.buildSuccessResponse("Post unsaved successfully");
    }

    @GetMapping("/feed")
    public ResponseEntity<?> getPostsInFeed(
            @RequestParam(required = false) String nextCursor
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var posts = searchPostService.getPostsInFeed(username, nextCursor);
        return ApiUtils.buildSuccessResponse(posts);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(
            @RequestParam String keyword,
            @RequestParam(required = false) String nextCursor
    ) {
        var username = SecurityContextUtils.getCurrentUsernameForController();
        var posts = searchPostService.searchPosts(username, keyword, nextCursor);
        return ApiUtils.buildSuccessResponse(posts);
    }

    @GetMapping("/{postId}/related")
    public ResponseEntity<?> getRelatedPosts(
            @PathVariable UUID postId
    ) {
        var posts = searchPostService.getRelatedPosts(postId);
        return ApiUtils.buildSuccessResponse(posts);
    }
}
