import { CourseCard } from "@/components/card/course-card";
import { SkeletonCard } from "@/components/card/skeleton-card";
import { ErrorState } from "@/components/common/error-state";
import { getFeaturedCourses } from "@/lib/api/courses";
import { Box } from "@mui/material";

export async function FeaturedCoursesSection() {
  try {
    const featuredCourses = await getFeaturedCourses();

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {featuredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </Box>
    );
  } catch (error) {
    return (
      <ErrorState
        title="Failed to load featured courses"
        subtitle="Please try again later"
      />
    );
  }
}

export function FeaturedCoursesFallback() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        },
        gap: { xs: 2, sm: 2.5, md: 3 },
      }}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </Box>
  );
}
