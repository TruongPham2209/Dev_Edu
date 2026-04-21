package com.pht.dev_edu.course.controller;

import com.pht.dev_edu.common.util.ApiUtils;
import com.pht.dev_edu.common.util.SecurityContextUtils;
import com.pht.dev_edu.course.dto.ReviewRequest;
import com.pht.dev_edu.course.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController("ReviewController")
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {
    ReviewService reviewService;

    @GetMapping("/")
    public ResponseEntity<?> getReviews(
            @RequestParam UUID courseId,
            @RequestParam(required = false) String nextCursor
    ) {
        var username = SecurityContextUtils.getCurrentUsername();
        var reviews = reviewService.getReviewsByCourse(username, courseId, nextCursor);
        return ApiUtils.buildSuccessResponse(reviews);
    }

    @PreAuthorize("hasAuthority('STUDENT')")
    @PostMapping("/")
    public ResponseEntity<?> createReview(@RequestBody @Valid ReviewRequest request) {
        var username = SecurityContextUtils.getCurrentUsername();
        var review = reviewService.createReview(username, request);
        return ApiUtils.buildSuccessResponse(review);
    }

    @DeleteMapping("/")
    public ResponseEntity<?> deleteReview(
            @RequestParam UUID reviewId
    ) {
        var username = SecurityContextUtils.getCurrentUsername();
        var authorities = SecurityContextUtils.getCurrentUserAuthorities();
        reviewService.deleteReview(authorities, username, reviewId);
        return ApiUtils.buildSuccessResponse("Review deleted successfully.");
    }
}
