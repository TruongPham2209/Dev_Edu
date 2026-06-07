"use client";

import { useCourseReviewsInfiniteQuery } from "@/lib/api/courses";
import { ReviewList } from "./review-list";
import type { CustomPaging } from "@/lib/type/api";
import type { ReviewResponse } from "@/lib/type/courses";

interface CourseReviewsSectionProps {
  courseId: string;
  rating: number;
  reviewCount: number;
}

export function CourseReviewsSection({
  courseId,
  rating,
  reviewCount,
}: CourseReviewsSectionProps) {
  const {
    data: reviewsData,
    isLoading: loadingReviews,
    isFetchingNextPage: loadingMoreReviews,
    hasNextPage,
    fetchNextPage,
  } = useCourseReviewsInfiniteQuery(courseId);

  const reviews =
    reviewsData?.pages.flatMap(
      (page: CustomPaging<ReviewResponse>) => page.contents || [],
    ) || [];
  const nextCursor = hasNextPage ? "has_more" : null;

  const loadMoreReviews = () => {
    if (hasNextPage && !loadingMoreReviews) {
      fetchNextPage();
    }
  };

  return (
    <ReviewList
      reviews={reviews}
      rating={rating}
      reviewCount={reviewCount}
      loadingReviews={loadingReviews}
      nextCursor={nextCursor}
      loadingMoreReviews={loadingMoreReviews}
      loadMoreReviews={loadMoreReviews}
    />
  );
}
