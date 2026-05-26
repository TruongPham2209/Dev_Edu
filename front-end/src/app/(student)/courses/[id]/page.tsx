"use client";

import { CoursePurchaseCard } from "@/components/card/course-purchase-card";
import { EmptyState } from "@/components/common/empty-state";
import { getCourseById, getCourseReviews, getCourses } from "@/lib/api/courses";
import { addToCart, getEnrollments } from "@/lib/api/enrollments";
import { getLecturesByCourse } from "@/lib/api/lectures";
import type {
  CourseResponse,
  LectureResponse,
  ReviewResponse,
} from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { useAuth } from "@/lib/use-auth";
import { Box, Container, Grid, Stack } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { StudentCourseDetailSkeleton } from "./course-detail-skeleton";
import { CourseAbout } from "./course-about";
import { CourseContent } from "./course-content";
import { HeroSection } from "./hero-section";
import { RelatedCourseList } from "./related-course-list";
import { ReviewList } from "./review-list";

export default function CourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const { handleError, showSuccess, toast } = useApiWithToast();
  const { isAuthenticated } = useAuth();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [loadingMoreReviews, setLoadingMoreReviews] = useState(false);

  const [relatedCourses, setRelatedCourses] = useState<CourseResponse[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  const [loadingAction, setLoadingAction] = useState<"buy" | "cart" | null>(
    null,
  );

  useEffect(() => {
    if (!courseId) return;

    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        // 1. Course Detail
        let courseData: CourseResponse | null = null;
        try {
          courseData = await getCourseById(courseId);
        } catch {
          if (isMounted) {
            toast.error("Course does not exist");
            router.push("/courses");
            return;
          }
        }

        if (!isMounted) return;
        if (!courseData) {
          toast.error("Course does not exist");
          router.push("/courses");
          return;
        }
        setCourse(courseData);

        // 2. Lectures
        try {
          const lectureData = await getLecturesByCourse(courseId);
          if (isMounted) setLectures(lectureData);
        } catch {
          // Handle lecture load error quietly
        }

        // 3. Reviews
        setLoadingReviews(true);
        try {
          const reviewsData = await getCourseReviews(courseId);
          if (isMounted) {
            setReviews(reviewsData.contents || []);
            setNextCursor(reviewsData.nextCursor || null);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setLoadingReviews(false);
        }

        // 4. Related Courses
        setLoadingRelated(true);
        try {
          const coursesData = await getCourses();
          if (isMounted) {
            const filtered = (coursesData.contents || [])
              .filter((c) => c.id !== courseId)
              .slice(0, 3);
            setRelatedCourses(filtered);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setLoadingRelated(false);
        }

        // Enrollment
        if (isAuthenticated) {
          try {
            await getEnrollments();
            // TODO check actual enrollment status correctly based on data.
            setIsEnrolled(false);
          } catch {
            setIsEnrolled(false);
          }
        }
      } catch (error) {
        if (!isMounted) return;
        handleError(error, "Could not load course");
        router.push("/courses");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();

    return () => {
      isMounted = false;
    };
  }, [courseId, router, isAuthenticated, toast, handleError]);

  const loadMoreReviews = async () => {
    if (!courseId || !nextCursor) return;
    setLoadingMoreReviews(true);
    try {
      const reviewsData = await getCourseReviews(courseId, nextCursor);
      setReviews((prev) => [...prev, ...(reviewsData.contents || [])]);
      setNextCursor(reviewsData.nextCursor || null);
    } catch (err) {
      handleError(err, "Could not load more reviews");
    } finally {
      setLoadingMoreReviews(false);
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
      await addToCart(course.id);
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

  if (loading && !course) {
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
                  loadingRelated={loadingRelated}
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
