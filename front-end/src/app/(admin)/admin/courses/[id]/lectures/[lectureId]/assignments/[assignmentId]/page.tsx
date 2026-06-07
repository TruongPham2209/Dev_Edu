"use client";

import {
  useAssignmentByIdQuery,
  useCreateFeedbackMutation,
  useDeleteFeedbackMutation,
  useFeedbacksQuery,
  useSubmissionsInfiniteQuery,
  useSubmissionTrackingQuery,
} from "@/lib/api/assignments";
import { useCourseByIdQuery } from "@/lib/api/courses";
import { getDownloadUrl } from "@/lib/api/files";
import { useLectureByIdQuery } from "@/lib/api/lectures";
import type {
  SubmissionLogResponse,
  SubmissionResponse,
} from "@/lib/type/assignments";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Container, Stack } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Modular Sub-components
import { ErrorState } from "@/components/common/error-state";
import { SubmissionDetailsDialog } from "@/components/dialog/submission-datail/page";
import { AssignmentDetailSkeleton } from "./assignment-detail-skeleton";
import { AssignmentHeroSection } from "./assignment-hero";
import { SubmissionsList } from "./submissions-list";

export default function AdminAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.assignmentId as string;
  const lectureId = params.lectureId as string;
  const courseId = params.id as string;
  const queryClient = useQueryClient();

  const { handleError, showSuccess } = useApiWithToast();

  // Core Data Queries via React Query
  const { data: assignment, isLoading: assignmentLoading } =
    useAssignmentByIdQuery(assignmentId);
  const { data: lecture, isLoading: lectureLoading } =
    useLectureByIdQuery(lectureId);
  const { data: course, isLoading: courseLoading } = useCourseByIdQuery(
    courseId,
    { enabled: !!courseId },
  );

  const pageLoading = assignmentLoading || lectureLoading || courseLoading;
  const pageError = !assignment && !assignmentLoading;

  // Submissions Paging States
  const {
    data: submissionsData,
    isLoading: submissionsQueryLoading,
    isFetchingNextPage: submissionsFetchingMore,
    hasNextPage: submissionsHasMore,
    fetchNextPage: fetchNextSubmissions,
  } = useSubmissionsInfiniteQuery(assignmentId);

  const submissions = submissionsData?.pages.flatMap((p) => p.contents) || [];
  const submissionsLoading = submissionsQueryLoading || submissionsFetchingMore;

  const loadSubmissionsList = async (reset = false) => {
    if (reset) {
      queryClient.invalidateQueries({
        queryKey: ["submissions", "infinite", assignmentId],
      });
    } else {
      fetchNextSubmissions();
    }
  };

  // --- Modal Specific States ---
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionResponse | null>(null);

  const {
    data: feedbacks = [],
    isLoading: feedbacksLoading,
    refetch: refetchFeedbacks,
  } = useFeedbacksQuery(assignmentId, selectedSubmission?.studentUsername, {
    enabled: !!selectedSubmission,
  });

  const [historyPage, setHistoryPage] = useState(0);

  const { data: trackingData, isLoading: historyLoading } =
    useSubmissionTrackingQuery(
      assignmentId,
      selectedSubmission?.studentUsername,
      historyPage,
      {
        enabled: !!selectedSubmission,
      },
    );

  const [history, setHistory] = useState<SubmissionLogResponse[]>([]);

  useEffect(() => {
    if (!selectedSubmission) {
      setHistory([]);
      setHistoryPage(0);
      return;
    }
    if (trackingData) {
      if (historyPage === 0) {
        setHistory(trackingData.contents);
      } else {
        setHistory((prev) => [...prev, ...trackingData.contents]);
      }
    }
  }, [trackingData, historyPage, selectedSubmission]);

  const historyHasMore = trackingData
    ? trackingData.currentPage < trackingData.totalPages - 1
    : false;

  const loadMoreHistory = async () => {
    if (historyLoading || !historyHasMore) return;
    setHistoryPage((prev) => prev + 1);
  };

  // --- Download Trigger ---
  const triggerDownload = async (fileObjectKey: string) => {
    try {
      const response = await queryClient.fetchQuery({
        queryKey: ["files", "download", fileObjectKey],
        queryFn: () => getDownloadUrl(fileObjectKey),
      });
      if (response?.downloadUrl) {
        window.open(response.downloadUrl, "_blank");
      } else {
        throw new Error("Download URL is missing");
      }
    } catch (err) {
      handleError(err, "Cannot download submission files");
    }
  };

  // --- Modal Selection & Parallel API Fetch ---
  const openSubmissionDetails = (submission: SubmissionResponse) => {
    setHistoryPage(0);
    setHistory([]);
    setSelectedSubmission(submission);
  };

  // --- Submit Feedback (Admin or Lecturer) ---
  const { mutateAsync: createFeedbackMutate } = useCreateFeedbackMutation();
  const { mutateAsync: deleteFeedbackMutate } = useDeleteFeedbackMutation();

  const handleAddFeedback = async (text: string) => {
    if (!selectedSubmission) return;
    try {
      await createFeedbackMutate({
        assignmentId,
        studentUsername: selectedSubmission.studentUsername,
        feedback: text,
      });
      showSuccess("Feedback added successfully");
      refetchFeedbacks();
      setHistoryPage(0);
    } catch (error) {
      handleError(error, "Failed to add feedback");
      throw error;
    }
  };

  // --- Delete Feedback (ADMIN mode allows deleting ANY feedback card) ---
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteFeedbackMutate(feedbackId);
      showSuccess("Feedback deleted successfully");
      refetchFeedbacks();
      setHistoryPage(0);
    } catch (error) {
      handleError(error, "Failed to delete feedback");
      throw error;
    }
  };

  // --- Skeleton Screen for Page Loading ---
  if (pageLoading && !assignment) {
    return <AssignmentDetailSkeleton />;
  }

  // --- Error Screen ---
  if (pageError || !assignment) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <ErrorState
          title="Cannot find assignment or error occurred"
          subtitle="This assignment may have been deleted or you do not have sufficient authority to access it."
          actionLabel="Go back to lecture"
          onRetry={() =>
            router.push(`/admin/courses/${courseId}/lectures/${lectureId}`)
          }
          iconAction={<ArrowLeft size={18} />}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack component="div" spacing={4}>
        {/* HERO SECTION COMPONENT */}
        <AssignmentHeroSection
          assignment={assignment}
          courseId={courseId}
          courseTitle={course?.title || "Khóa học"}
          lectureId={lectureId}
          lectureTitle={lecture?.title || "Bài giảng"}
          submissionsTotal={submissions.length}
        />

        {/* SUBMISSIONS LIST COMPONENT (AUTO-INFINITE SCROLL) */}
        <SubmissionsList
          submissions={submissions}
          submissionsLoading={submissionsLoading}
          submissionsHasMore={submissionsHasMore}
          loadSubmissions={loadSubmissionsList}
          triggerDownload={triggerDownload}
          openSubmissionDetails={openSubmissionDetails}
        />
      </Stack>

      {/* SHARED PREMIUM DETAILS MODAL (ADMIN behavior enabled) */}
      <SubmissionDetailsDialog
        open={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        selectedSubmission={selectedSubmission}
        isAdmin={true} // ADMIN mode enabled
        feedbacks={feedbacks}
        feedbacksLoading={feedbacksLoading}
        onAddFeedback={handleAddFeedback}
        onDeleteFeedback={handleDeleteFeedback}
        history={history}
        historyLoading={historyLoading}
        historyHasMore={historyHasMore}
        onLoadMoreHistory={loadMoreHistory}
        triggerDownload={triggerDownload}
      />
    </Container>
  );
}
