"use client";

import { useCourseByIdQuery, useCoursesQuery } from "@/lib/api/courses";
import { useLecturesByCourseQuery } from "@/lib/api/lectures";
import { Box, Container, Grid, Stack } from "@mui/material";
import { notFound } from "next/navigation";
import { use } from "react";
import { CourseAbout } from "./course-about";
import { CourseContent } from "./course-content";
import { StudentCourseDetailSkeleton } from "./course-detail-skeleton";
import { CoursePurchaseSection } from "./course-purchase-section";
import { CourseReviewsSection } from "./course-reviews-section";
import { HeroSection } from "./hero-section";
import { RelatedCourseList } from "./related-course-list";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: CourseDetailPageProps) {
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
    return <StudentCourseDetailSkeleton />;
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
        bgcolor: "background.default",
        minHeight: "100vh",
        pb: { xs: 6, sm: 10, md: 12 },
        backgroundImage: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at top center, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 1) 100%)"
            : "radial-gradient(circle at top center, rgba(255,255,255,1) 0%, rgba(241,245,249,1) 100%)",
        overflowX: "clip",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ position: "relative", zIndex: 1, pt: { xs: 2.5, sm: 4, lg: 8 }, pb: { xs: 8, sm: 4 } }}
      >
        <Grid container spacing={{ xs: 2.5, sm: 3.5, md: 4 }}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            <HeroSection
              course={course}
              mobilePurchaseCard={
                <CoursePurchaseSection
                  course={course}
                  isEnrolled={course.registered}
                  lectures={lectures}
                />
              }
            />

            {/* MAIN CONTENT */}
            <Box sx={{ pb: 4 }}>
              <Stack spacing={{ xs: 4, sm: 6, md: 8 }}>
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
