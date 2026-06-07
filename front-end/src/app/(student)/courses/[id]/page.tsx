import { getCourseById, getCourses } from "@/lib/api/courses";
import { getEnrollments } from "@/lib/api/enrollments";
import { getLecturesByCourse } from "@/lib/api/lectures";
import { Box, Container, Grid, Stack } from "@mui/material";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { CourseAbout } from "./course-about";
import { CourseContent } from "./course-content";
import { CoursePurchaseSection } from "./course-purchase-section";
import { CourseReviewsSection } from "./course-reviews-section";
import { HeroSection } from "./hero-section";
import { RelatedCourseList } from "./related-course-list";
import { LectureResponse } from "@/lib/type/lectures";
import { CourseResponse } from "@/lib/type/courses";

interface CourseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { id: courseId } = await params;

  if (!courseId) {
    notFound();
  }

  let course;
  try {
    course = await getCourseById(courseId);
  } catch (error) {
    console.error("Course not found:", error);
    notFound();
  }

  if (!course) {
    notFound();
  }

  let lectures: LectureResponse[] = [];
  try {
    lectures = await getLecturesByCourse(courseId);
  } catch (error) {
    console.error("Lectures fetch failed:", error);
  }

  let relatedCourses: CourseResponse[] = [];
  try {
    const relatedCoursesData = await getCourses();
    relatedCourses = (relatedCoursesData?.contents || [])
      .filter((c) => c.id !== courseId)
      .slice(0, 3);
  } catch (error) {
    console.error("Related courses fetch failed:", error);
  }

  let isEnrolled = false;
  let isLoggedIn = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      isLoggedIn = true;
      const enrollmentsData = await getEnrollments();
      isEnrolled = (enrollmentsData?.contents || []).some(
        (c) => c.courseId === courseId || c.id === courseId,
      );
    }
  } catch (error) {
    console.error("Enrollment check failed:", error);
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
              <CoursePurchaseSection
                course={course}
                isEnrolled={isEnrolled}
                lectures={lectures}
                isLoggedIn={isLoggedIn}
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
              isEnrolled={isEnrolled}
              lectures={lectures}
              isLoggedIn={isLoggedIn}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
