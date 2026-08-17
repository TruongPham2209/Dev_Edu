"use client";

import { Box, Breadcrumbs, Container, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Home, Info, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
import { formatServerDate } from "@/lib/util/date-utils";

// Modular Sub-components
import { AnimatedTabs } from "@/components/common/animated-tabs";
import { ErrorState } from "@/components/common/error-state";
import { AssignmentHeroInfo } from "@/components/common/hero-section/assignment-hero-info";
import { SubmissionDetailsDialog } from "@/components/dialog/submission-datail/page";
import { AssignmentDetailSkeleton } from "./assignment-detail-skeleton";
import { AssignmentOverview } from "./assignment-overview";
import { SubmissionsTable } from "./submissions-table";

export default function LecturerAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { handleError, showSuccess } = useApiWithToast();

  const assignmentId = params.assignmentId as string;
  const lectureId = params.lectureId as string;
  const courseId = params.id as string;

  // --- React Query details ---
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

  // --- Page Tabs ---
  const [activeTab, setActiveTab] = useState<"overview" | "submissions">(
    "overview",
  );

  // --- Submissions Listing React Query ---
  const {
    data: submissionsData,
    isLoading: submissionsQueryLoading,
    isFetchingNextPage: submissionsFetchingMore,
    hasNextPage: submissionsHasMore,
    fetchNextPage: fetchNextSubmissions,
  } = useSubmissionsInfiniteQuery(assignmentId);

  const submissions = submissionsData?.pages.flatMap((p) => p.contents) || [];
  const submissionsTotal = submissionsData?.pages[0]?.totalElements || 0;
  const submissionsLoading = submissionsQueryLoading || submissionsFetchingMore;

  const loadSubmissions = async (reset = false) => {
    if (reset) {
      // React query automatically refetches or keeps the cached pages,
      // but if we want to explicitly reset/invalidate we can:
      queryClient.invalidateQueries({
        queryKey: ["submissions", "infinite", assignmentId],
      });
    } else {
      fetchNextSubmissions();
    }
  };

  // --- Selected Submission Modal States ---
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

  // --- Handle File Downloads ---
  const triggerDownload = async (fileObjectKey: string) => {
    try {
      const response = await queryClient.fetchQuery({
        queryKey: ["files", "download", fileObjectKey],
        queryFn: () => getDownloadUrl(fileObjectKey),
      });
      if (response?.downloadUrl) {
        window.open(response.downloadUrl, "_blank");
      } else {
        showSuccess("Download link is opening");
      }
    } catch (error) {
      handleError(error, "Failed to create download link");
    }
  };

  const openSubmissionDetails = (submission: SubmissionResponse) => {
    setHistoryPage(0);
    setHistory([]);
    setSelectedSubmission(submission);
  };

  // --- Submissions Feedback Submission ---
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
      showSuccess("Successfully added feedback");
      refetchFeedbacks();
      setHistoryPage(0);
    } catch (error) {
      handleError(error, "Failed to add feedback");
      throw error;
    }
  };

  // --- Delete Submissions Feedback ---
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteFeedbackMutate(feedbackId);
      showSuccess("Successfully deleted feedback");
      refetchFeedbacks();
      setHistoryPage(0);
    } catch (error) {
      handleError(error, "Failed to delete feedback");
      throw error;
    }
  };

  const getFileNameFromKey = (key: string) => {
    if (!key) return "Attachment";
    return key.split("/").pop() || key;
  };

  // --- SKELETON LOADER STATE (Avoids Layout Shift) ---
  if (pageLoading) {
    return <AssignmentDetailSkeleton />;
  }

  // --- ERROR FALLBACK STATE ---
  if (pageError || !assignment) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <ErrorState
          title="Failed to load assignment details"
          subtitle="The resource may not exist, has been deleted, or your account does not have permission to access it."
          onRetry={() =>
            router.push(`/lecturer/courses/${courseId}/lectures/${lectureId}`)
          }
          actionLabel="Back to Lecture"
          iconAction={<ArrowLeft size={16} />}
        />
      </Container>
    );
  }

  const courseTitle = course?.title || "Khóa học";
  const lectureTitle = lecture?.title || "Bài giảng";

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* 1. Elegant Breadcrumbs Navigation */}
      <Breadcrumbs
        separator={<ChevronRight size={14} style={{ flexShrink: 0 }} />}
        sx={{
          mb: { xs: 2, sm: 3 },
          "& .MuiBreadcrumbs-ol": {
            alignItems: "center",
            flexWrap: "nowrap",
            overflow: "hidden",
          },
          "& .MuiBreadcrumbs-li": {
            display: "inline-flex",
            alignItems: "center",
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            fontWeight: 500,
            minWidth: 0,
          },
          "& .MuiBreadcrumbs-separator": {
            mx: { xs: 0.5, sm: 1 },
            color: "text.disabled",
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
          },
        }}
      >
        <Link
          href="/lecturer"
          className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors gap-1 shrink-0"
          style={{ textDecoration: "none", lineHeight: 1.4 }}
        >
          <Home size={14} style={{ flexShrink: 0 }} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <Link
          href={`/lecturer/courses/${courseId}`}
          className="text-slate-500 hover:text-slate-900 transition-colors truncate"
          style={{
            textDecoration: "none",
            lineHeight: 1.4,
            maxWidth: 100,
            display: "inline-block",
          }}
          title={courseTitle}
        >
          {courseTitle}
        </Link>
        <Link
          href={`/lecturer/courses/${courseId}/lectures/${lectureId}`}
          className="text-slate-500 hover:text-slate-900 transition-colors truncate"
          style={{
            textDecoration: "none",
            lineHeight: 1.4,
            maxWidth: 110,
            display: "inline-block",
          }}
          title={lectureTitle}
        >
          {lectureTitle}
        </Link>
        <Typography
          component="span"
          sx={{
            color: "text.primary",
            fontWeight: 700,
            lineHeight: 1.4,
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: { xs: 120, sm: 250, md: "none" },
            display: "inline-block",
          }}
          title={assignment.title}
        >
          {assignment.title}
        </Typography>
      </Breadcrumbs>

      {/* 2. Premium Hero Banner */}
      <AssignmentHeroInfo
        assignment={assignment}
        lectureTitle={lectureTitle}
        submissionsTotal={submissionsTotal}
      />

      {/* 3. Sticky Navigation Tabs (Modern Pill/Slide Styling) */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: { xs: 2.5, sm: 4 },
          position: "sticky",
          top: 0,
          bgcolor: "background.default",
          zIndex: 10,
          pt: 1,
          overflowX: "auto",
        }}
      >
        <AnimatedTabs
          value={activeTab}
          onChange={setActiveTab}
          colorTheme="success"
          tabs={[
            {
              value: "overview",
              label: "Overview",
              icon: <Info size={16} />,
            },
            {
              value: "submissions",
              label: "Submissions",
              icon: <Users size={16} />,
            },
          ]}
        />
      </Box>

      {/* 4. Tab Context Area */}
      <Box sx={{ pb: 6 }}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <AssignmentOverview assignment={assignment} />
        )}

        {/* SUBMISSIONS TAB */}
        {activeTab === "submissions" && (
          <SubmissionsTable
            submissions={submissions}
            submissionsLoading={submissionsLoading}
            submissionsHasMore={submissionsHasMore}
            loadSubmissions={loadSubmissions}
            triggerDownload={triggerDownload}
            openSubmissionDetails={openSubmissionDetails}
            formatServerDate={formatServerDate}
            getFileNameFromKey={getFileNameFromKey}
          />
        )}
      </Box>

      {/* --- SUBMISSION DETAILS MODAL OVERLAY --- */}
      <SubmissionDetailsDialog
        open={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        selectedSubmission={selectedSubmission}
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
