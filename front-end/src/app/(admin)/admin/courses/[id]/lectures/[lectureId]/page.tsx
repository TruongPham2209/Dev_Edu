"use client";

import { ErrorState } from "@/components/common/error-state";
import { useAssignmentsQuery } from "@/lib/api/assignments";
import { useCourseByIdQuery } from "@/lib/api/courses";
import { useLectureByIdQuery, useMaterialsQuery } from "@/lib/api/lectures";
import { Box, Skeleton, Stack } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { AssignmentsList } from "./assignments-list";
import { LectureDetailSkeleton } from "./lecture-detail-skeleton";
import { LectureHeroSection } from "./lecture-hero";
import { MaterialsList } from "./materials-list";

export default function AdminLectureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params.lectureId as string;
  const courseId = params.id as string;

  // Core data queries via React Query
  const { data: lecture, isLoading: loadingLecture } =
    useLectureByIdQuery(lectureId);
  const { data: course, isLoading: courseLoading } = useCourseByIdQuery(
    courseId,
    { enabled: !!courseId },
  );
  const {
    data: materials = [],
    isLoading: materialsLoading,
    refetch: refetchMaterials,
  } = useMaterialsQuery(lectureId, { enabled: !!lectureId });
  const {
    data: assignments = [],
    isLoading: assignmentsLoading,
    refetch: refetchAssignments,
  } = useAssignmentsQuery(lectureId, { enabled: !!lectureId });

  const loadingSecondary =
    courseLoading || materialsLoading || assignmentsLoading;
  const courseTitle = course?.title || "";

  // Materials updates
  const handleMaterialCreated = () => {
    refetchMaterials();
  };

  const handleMaterialDeleted = () => {
    refetchMaterials();
  };

  // Assignments updates
  const handleAssignmentCreated = () => {
    refetchAssignments();
  };

  const handleAssignmentDeleted = () => {
    refetchAssignments();
  };

  // 1. Initial Lecture Loading Skeleton State
  if (loadingLecture) {
    return <LectureDetailSkeleton />;
  }

  // 2. Not Found Empty State
  if (!lecture) {
    return (
      <Box sx={{ p: 4 }}>
        <ErrorState
          title="Lecture not found"
          subtitle="The lecture may have been deleted or the path is incorrect."
          actionLabel="Go to course"
          onRetry={() => router.push(`/admin/courses/${courseId}`)}
          iconAction={<BookOpen size={18} />}
        />
      </Box>
    );
  }

  return (
    <Stack spacing={4} sx={{ pb: 6 }}>
      {/* Hero Section */}
      <LectureHeroSection
        lecture={lecture}
        courseId={courseId}
        courseTitle={courseTitle || "Course"}
        materialsCount={materials.length}
        assignmentsCount={assignments.length}
      />

      {/* Main grids for Materials & Assignments */}
      <Stack direction="column" spacing={4}>
        {/* Secondary Data Loading Placeholder */}
        {loadingSecondary && (
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: 4 }} />
        )}

        {!loadingSecondary && (
          <>
            {/* Materials Section */}
            <MaterialsList
              materials={materials}
              lectureId={lectureId}
              onMaterialCreated={handleMaterialCreated}
              onMaterialDeleted={handleMaterialDeleted}
            />

            <AssignmentsList
              courseId={courseId}
              lectureId={lectureId}
            />
          </>
        )}
      </Stack>
    </Stack>
  );
}
