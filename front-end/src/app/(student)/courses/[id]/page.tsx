"use client";

import { CoursePurchaseCard } from "@/components/card/course-purchase-card";
import { EmptyState } from "@/components/common/empty-state";
import {
  useCourseByIdQuery,
  useCoursesQuery,
  useCourseReviewsInfiniteQuery,
} from "@/lib/api/courses";
import type { CustomPaging, ReviewResponse } from "@/lib/api/types";
import {
  useAddToCartMutation,
  useEnrollmentsQuery,
} from "@/lib/api/enrollments";
import { useLecturesByCourseQuery } from "@/lib/api/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { useAuth } from "@/lib/use-auth";
import { Box, Container, Grid, Stack } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CourseAbout } from "./course-about";
import { CourseContent } from "./course-content";
import { StudentCourseDetailSkeleton } from "./course-detail-skeleton";
import { HeroSection } from "./hero-section";
import { RelatedCourseList } from "./related-course-list";
import { ReviewList } from "./review-list";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const { handleError, showSuccess, toast } = useApiWithToast();
  const { isAuthenticated } = useAuth();

  const [loadingAction, setLoadingAction] = useState<"buy" | "cart" | null>(
    null,
  );

  const {
    data: course,
    isLoading: courseLoading,
    error: courseError,
  } = useCourseByIdQuery(courseId);
  const { data: lectures = [] } = useLecturesByCourseQuery(courseId);
  const { data: relatedCoursesData } = useCoursesQuery();

  const relatedCourses = (relatedCoursesData?.contents || [])
    .filter((c) => c.id !== courseId)
    .slice(0, 3);

  const {
    data: reviewsData,
    isLoading: loadingReviews,
    isFetchingNextPage: loadingMoreReviews,
    hasNextPage,
    fetchNextPage,
  } = useCourseReviewsInfiniteQuery(courseId);

  const reviews = reviewsData?.pages.flatMap((page: CustomPaging<ReviewResponse>) => page.contents || []) || [];
  const nextCursor = hasNextPage ? "has_more" : null;

  const { data: enrollmentsData } = useEnrollmentsQuery(undefined, {
    enabled: isAuthenticated,
  });

  const isEnrolled = useMemo(() => {
    if (!enrollmentsData?.contents) return false;
    return enrollmentsData.contents.some(
      (c) => c.courseId === courseId || c.id === courseId,
    );
  }, [enrollmentsData, courseId]);

  const { mutateAsync: addToCartMutate } = useAddToCartMutation();

  useEffect(() => {
    if (courseError) {
      toast.error("Course does not exist");
      router.push("/courses");
    }
  }, [courseError, router, toast]);

  const loadMoreReviews = () => {
    if (hasNextPage && !loadingMoreReviews) {
      fetchNextPage();
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }
    router.push(`/checkout`);
  };

  const handleAddToCart = async () => {
    if (!course) return;
    setLoadingAction("cart");
    try {
      await addToCartMutate(course.id);
      showSuccess("Added to cart successfully");
    } catch (error) {
      handleError(error, "Could not add to cart");
    } finally {
      setLoadingAction(null);
    }
  };

  if (!courseId) {
    return null;
  }

  if (courseLoading && !course) {
    return <StudentCourseDetailSkeleton />;
  }

  if (!course) {
    return <EmptyState title="Could not find course" />;
  }

  return (
    <Box
      sx={{
        bgcolor: "#f1f5f9",
        minHeight: "100vh",
        pb: 12,
        backgroundImage:
          "radial-gradient(circle at top center, rgba(255,255,255,1) 0%, rgba(241,245,249,1) 100%)",
        overflowX: "clip",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ position: "relative", zIndex: 1, pt: { xs: 4, md: 6, lg: 8 } }}
      >
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <HeroSection course={course} />

            {/* MOBILE ONLY: Purchase Card stacks perfectly below Hero content */}
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 6 }}>
              <CoursePurchaseCard
                course={course}
                isEnrolled={isEnrolled}
                lectures={lectures}
                handleBuyNow={handleBuyNow}
                handleAddToCart={handleAddToCart}
                loadingAction={loadingAction}
                isLoggedIn={isAuthenticated}
              />
            </Box>

            {/* MAIN CONTENT */}
            <Box sx={{ pb: 4 }}>
              <Stack spacing={8}>
                <CourseAbout description={course.description} />
                <CourseContent lectures={lectures} />
                <ReviewList
                  reviews={reviews}
                  rating={course.avgReview}
                  reviewCount={course.totalReview}
                  loadingReviews={loadingReviews}
                  nextCursor={nextCursor}
                  loadingMoreReviews={loadingMoreReviews}
                  loadMoreReviews={loadMoreReviews}
                />
                <RelatedCourseList
                  relatedCourses={relatedCourses}
                  loadingRelated={!relatedCoursesData}
                />
              </Stack>
            </Box>
          </Grid>

          {/* DESKTOP ONLY: RIGHT STICKY COLUMN */}
          <Grid
            size={{ xs: 12, md: 5, lg: 4 }}
            sx={{
              display: { xs: "none", md: "block" },
              position: "sticky",
              top: 100,
              alignSelf: "flex-start",
              zIndex: 100,
            }}
          >
            <CoursePurchaseCard
              course={course}
              isEnrolled={isEnrolled}
              lectures={lectures}
              handleBuyNow={handleBuyNow}
              handleAddToCart={handleAddToCart}
              loadingAction={loadingAction}
              isLoggedIn={isAuthenticated}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
