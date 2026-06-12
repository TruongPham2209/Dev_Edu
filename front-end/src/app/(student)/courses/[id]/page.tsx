"use client";

import { useCourseByIdQuery, useCoursesQuery } from "@/lib/api/courses";
import { useLecturesByCourseQuery } from "@/lib/api/lectures";
import { Box, CircularProgress, Container, Grid, Stack } from "@mui/material";
import { notFound } from "next/navigation";
import { use } from "react";
import { CourseAbout } from "./course-about";
import { CourseContent } from "./course-content";
import { CoursePurchaseSection } from "./course-purchase-section";
import { CourseReviewsSection } from "./course-reviews-section";
import { HeroSection } from "./hero-section";
import { RelatedCourseList } from "./related-course-list";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id: courseId } = use(params);

  if (!courseId) {
    notFound();
  }

  const {
    data: course,
    isLoading: loadingCourse,
    error: courseError,
  } = useCourseByIdQuery(courseId);

  const { data: lectures = [] } = useLecturesByCourseQuery(courseId);

  const { data: allCoursesData } = useCoursesQuery();

  if (loadingCourse) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8, minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (courseError || !course) {
    notFound();
  }

  const relatedCourses = (allCoursesData?.contents || [])
    .filter((c) => c.id !== courseId)
    .slice(0, 3);

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
              <CoursePurchaseSection
                course={course}
                isEnrolled={course.registered}
                lectures={lectures}
              />
            </Box>

            {/* MAIN CONTENT */}
            <Box sx={{ pb: 4 }}>
              <Stack spacing={8}>
                <CourseAbout description={course.description} />
                <CourseContent lectures={lectures} />
                <CourseReviewsSection
                  courseId={courseId}
                  rating={course.avgReview}
                  reviewCount={course.totalReview}
                />
                <RelatedCourseList
                  relatedCourses={relatedCourses}
                  loadingRelated={false}
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
            <CoursePurchaseSection
              course={course}
              isEnrolled={course.registered}
              lectures={lectures}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
