package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.course.dto.ReviewRequest;
import com.pht.dev_edu.course.dto.ReviewResponse;

import java.util.Set;
import java.util.UUID;

public interface ReviewService {
    ReviewResponse createReview(String username, ReviewRequest request);

    void deleteReview(Set<String> authorities, String username, UUID reviewId);

    CustomPaging<ReviewResponse> getReviewsByCourse(String username, UUID courseId, String nextCursor);
}
