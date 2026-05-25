"use client";

import { ErrorState } from "@/components/common/error-state";
import { getAssignments } from "@/lib/api/assignments";
import { getCourseById } from "@/lib/api/courses";
import { getLectureById, getMaterials } from "@/lib/api/lectures";
import type {
  AssignmentResponse,
  LectureResponse,
  MaterialResponse,
} from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Skeleton, Stack } from "@mui/material";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssignmentsList } from "./assignments-list";
import { LectureDetailSkeleton } from "./lecture-detail-skeleton";
import { LectureHeroSection } from "./lecture-hero";
import { MaterialsList } from "./materials-list";
import { BookOpen } from "lucide-react";

export default function AdminLectureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const lectureId = params.lectureId as string;
  const courseId = params.id as string;
  const { handleError, showSuccess } = useApiWithToast();

  // Core data states
  const [lecture, setLecture] = useState<LectureResponse | null>(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);

  // Loading states
  const [loadingLecture, setLoadingLecture] = useState(true);
  const [loadingSecondary, setLoadingSecondary] = useState(false);

  // Modal / Dialog states
  const [form, setForm] = useState({ title: "", summary: "", content: "" });

  // Sequential loading: First getLectureById, then secondary APIs
  const loadLectureData = async () => {
    try {
      setLoadingLecture(true);
      const lectureData = await getLectureById(lectureId);
      setLecture(lectureData);
      setForm({
        title: lectureData.title,
        summary: lectureData.summary,
        content: lectureData.content || "",
      });

      // Lecture resolved successfully! Now load secondary metadata in parallel
      loadSecondaryData();
    } catch (error) {
      handleError(error, "Failed to load lecture information");
    } finally {
      setLoadingLecture(false);
    }
  };

  const loadSecondaryData = async () => {
    try {
      setLoadingSecondary(true);
      const [courseData, materialData, assignmentData] = await Promise.all([
        getCourseById(courseId),
        getMaterials(lectureId),
        getAssignments(lectureId),
      ]);
      setCourseTitle(courseData.title);
      setMaterials(materialData);
      setAssignments(assignmentData);
    } catch (error) {
      // Gracefully handle metadata load errors without breaking the main UI
      console.error("Error when loading secondary lecture data:", error);
    } finally {
      setLoadingSecondary(false);
    }
  };

  useEffect(() => {
    if (lectureId) {
      loadLectureData();
    }
  }, [lectureId]);

  // Materials updates
  const handleMaterialCreated = (newMaterial: MaterialResponse) => {
    // Append to the top of list
    setMaterials((prev) => [newMaterial, ...prev]);
  };

  const handleMaterialDeleted = (deletedId: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== deletedId));
  };

  // Assignments updates
  const handleAssignmentCreated = (newAssignment: AssignmentResponse) => {
    // Append to the top of list
    setAssignments((prev) => [newAssignment, ...prev]);
  };

  const handleAssignmentDeleted = (deletedId: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== deletedId));
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

            {/* Assignments Section */}
            <AssignmentsList
              assignments={assignments}
              courseId={courseId}
              lectureId={lectureId}
              onAssignmentCreated={handleAssignmentCreated}
              onAssignmentDeleted={handleAssignmentDeleted}
            />
          </>
        )}
      </Stack>
    </Stack>
  );
}
