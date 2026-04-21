package com.pht.dev_edu.course.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.dto.TimeStampCursor;
import com.pht.dev_edu.common.exception.data.BadRequestException;
import com.pht.dev_edu.common.util.PagingUtils;
import com.pht.dev_edu.course.dto.ReviewRequest;
import com.pht.dev_edu.course.dto.ReviewResponse;
import com.pht.dev_edu.course.entity.CourseReviewEntity;
import com.pht.dev_edu.course.mapper.ReviewMapper;
import com.pht.dev_edu.course.repo.CourseReviewRepository;
import com.pht.dev_edu.enrollment.repo.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ReviewServiceImpl implements ReviewService {
    EnrollmentRepository enrollmentRepository;
    CourseReviewRepository reviewRepository;

    ReviewMapper reviewMapper;

    @Override
    @Transactional
    public ReviewResponse createReview(String username, ReviewRequest request) {
        if (!enrollmentRepository.existsByStudentUsernameAndCourseId(username, request.getCourseId())) {
            log.error("User {} is not enrolled in course ID {} and cannot create a review", username, request.getCourseId());
            throw new BadRequestException("You must be enrolled in the course to create a review.");
        }

        var reviewEntity = reviewMapper.reqToEntity(request);
        reviewEntity.setStudentUsername(username);
        reviewRepository.save(reviewEntity);

        return reviewMapper.entityToResponse(reviewEntity);
    }

    @Override
    @Transactional
    public void deleteReview(Set<String> authorities, String username, UUID reviewId) {
        var review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            log.error("Review with ID {} not found for deletion", reviewId);
            return;
        }

        boolean hasDeletePermission = authorities.contains(RoleEnum.ADMIN.name())
                                      || review.getStudentUsername().equals(username);
        if (!hasDeletePermission) {
            log.error("User {} does not have permission to delete review with ID {}", username, reviewId);
            throw new BadRequestException("You do not have permission to delete this review.");
        }

        reviewRepository.delete(review);
    }

    @Override
    public CustomPaging<ReviewResponse> getReviewsByCourse(String username, UUID courseId, String nextCursor) {
        var cursor = StringUtils.hasText(nextCursor)
                ? PagingUtils.decodeTimeStampCursor(nextCursor)
                : TimeStampCursor.getDefaultCursor(true);
        var pageable = PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "created_at", "id"));

        var pageResult = reviewRepository.findByCourseIdAndCursor(courseId, cursor.getId(), cursor.getTimeStamp(), pageable);

        // Remove my comments from the page result if they exist, to avoid duplication
        List<CourseReviewEntity> content = new java.util.ArrayList<>(pageResult.getContent()
                .stream()
                .filter(review -> !review.getStudentUsername().equals(username))
                .toList());
        if (!StringUtils.hasText(nextCursor) && StringUtils.hasText(username)) {
            var myComments = reviewRepository.findByStudentUsernameAndCourseIdOrderByCreatedAtDesc(username, courseId);
            content.addAll(0, myComments);
        }
        pageResult = new PageImpl<>(
                content,
                pageResult.getPageable(),
                pageResult.getTotalElements()
        );

        return PagingUtils.getPagedWithCursor(
                pageResult,
                reviewMapper::entityToResponse,
                CourseReviewEntity::getCreatedAt,
                CourseReviewEntity::getId
        );
    }
}
