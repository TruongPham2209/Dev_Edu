"use client";

import { ErrorState } from "@/components/common/error-state";
import { getCourseById } from "@/lib/api/courses";
import type { CourseResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Grid, Stack } from "@mui/material";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminCourseDetailSkeleton } from "./course-detail-skeleton";

// Custom Admin Course Detail Page Components
import { CourseHero } from "./course-hero";
import { DiscountsList } from "./discounts-list";
import { LecturersList } from "./lecturers-list";
import { LecturesList } from "./lectures-list";
import { StudentsList } from "./students-list";
import { ReviewList } from "./review-list";

export default function AdminCourseDetailPage() {
  const params = useParams();
  const courseId = params.id as string;
  const { handleError } = useApiWithToast();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Re-calculated metrics counts updated by list components dynamically
  const [lecturesCount, setLecturesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [discountsCount, setDiscountsCount] = useState(0);

  // Prevent multiple parallel initial API calls
  const isFetchingCourseRef = useRef(false);

  const fetchCourseDetails = useCallback(async () => {
    if (!courseId || isFetchingCourseRef.current) return;
    isFetchingCourseRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const data = await getCourseById(courseId);
      if (data) {
        setCourse(data as CourseResponse);
      } else {
        throw new Error("Failed to fetch course details.");
      }
    } catch (err) {
      setError(true);
      handleError(err, "Failed to fetch course details.");
    } finally {
      setLoading(false);
      isFetchingCourseRef.current = false;
    }
  }, [courseId, handleError]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  // Loading Skeleton State
  if (loading) {
    return <AdminCourseDetailSkeleton />;
  }

  // Error Fallback State
  if (error || !course) {
    return (
      <Box sx={{ p: 4, width: "100%" }}>
        <ErrorState
          title="Failed to fetch course details"
          subtitle="An error occurred while connecting to the system or the course does not exist. Please refresh the page."
          onRetry={fetchCourseDetails}
          actionLabel="Retry"
        />
      </Box>
    );
  }

  return (
    <Stack spacing={4} sx={{ width: "100%" }}>
      {/* Hero Section containing breadcrumbs, course info & metric counters */}
      <CourseHero
        course={course}
        lecturesCount={lecturesCount}
        studentsCount={studentsCount}
        discountsCount={discountsCount}
        lecturersCount={course.lecturers?.length ?? 0}
      />

      {/* Data Row: Lectures list and Discount campaign list */}
      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <LecturesList
            courseId={courseId}
            onTotalCountChange={setLecturesCount}
          />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <DiscountsList
            courseId={courseId}
            onTotalCountChange={setDiscountsCount}
          />
        </Grid>
      </Grid>

      {/* User Row: Lecturers list and Enrolled Students list */}
      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <LecturersList lecturers={course.lecturers} />
        </Grid>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <StudentsList
            courseId={courseId}
            onTotalCountChange={setStudentsCount}
          />
        </Grid>
      </Grid>

      {/* Review Row: Review list */}
      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ display: "flex", flexDirection: "column" }}
        >
          <ReviewList courseId={courseId} />
        </Grid>
      </Grid>
    </Stack>
  );
}
