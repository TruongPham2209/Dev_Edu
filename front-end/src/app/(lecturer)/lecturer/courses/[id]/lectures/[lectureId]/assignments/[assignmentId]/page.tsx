"use client";

import { Box, Breadcrumbs, Container, Typography } from "@mui/material";
import { ArrowLeft, ChevronRight, Home, Info, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  createFeedback,
  deleteFeedback,
  getAssignmentById,
  getFeedbacks,
  getSubmissions,
  getSubmissionTracking,
} from "@/lib/api/assignments";
import { getCourseById } from "@/lib/api/courses";
import { getDownloadUrl } from "@/lib/api/files";
import { getLectureById } from "@/lib/api/lectures";
import type {
  AssignmentResponse,
  FeedbackResponse,
  LectureResponse,
  SubmissionLogResponse,
  SubmissionResponse,
} from "@/lib/api/types";
import { formatServerDate } from "@/lib/util/date-utils";
import { useApiWithToast } from "@/lib/use-api-with-toast";

// Modular Sub-components
import { AnimatedTabs } from "@/components/common/animated-tabs";
import { AssignmentHeroInfo } from "@/components/common/assignment-hero-info";
import { ErrorState } from "@/components/common/error-state";
import { SubmissionDetailsDialog } from "@/components/dialog/submission-datail/page";
import { useRouter } from "next/navigation";
import { AssignmentDetailSkeleton } from "./assignment-detail-skeleton";
import { AssignmentOverview } from "./assignment-overview";
import { SubmissionsTable } from "./submissions-table";

export default function LecturerAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { handleError, showSuccess } = useApiWithToast();

  const assignmentId = params.assignmentId as string;
  const lectureId = params.lectureId as string;
  const courseId = params.id as string;

  // --- Primary Data States ---
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [lecture, setLecture] = useState<LectureResponse | null>(null);
  const [course, setCourse] = useState<any | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);

  // --- Page Tabs ---
  const [activeTab, setActiveTab] = useState<"overview" | "submissions">(
    "overview",
  );

  // --- Submissions Listing States ---
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [submissionsPage, setSubmissionsPage] = useState(0);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsHasMore, setSubmissionsHasMore] = useState(true);
  const [submissionsTotal, setSubmissionsTotal] = useState(0);

  // --- Selected Submission Modal States ---
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionResponse | null>(null);

  // Modal Details fetched in parallel

  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);

  const [history, setHistory] = useState<SubmissionLogResponse[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyHasMore, setHistoryHasMore] = useState(true);

  // --- Initial Data Load (Parallel) ---
  const loadPageData = async () => {
    setPageLoading(true);
    setPageError(false);
    try {
      const [assignmentData, lectureData, courseData] = await Promise.all([
        getAssignmentById(assignmentId),
        getLectureById(lectureId),
        getCourseById(courseId).catch((err) => {
          console.error("Failed to load course details", err);
          return null; // Fallback so page doesn't crash
        }),
      ]);

      setAssignment(assignmentData);
      setLecture(lectureData);
      setCourse(courseData);
    } catch (err) {
      setPageError(true);
      handleError(err, "Failed to load assignment details");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId && lectureId && courseId) {
      loadPageData();
    }
  }, [assignmentId, lectureId, courseId]);

  // --- Submissions Loader ---
  const loadSubmissions = async (reset = false) => {
    if (submissionsLoading) return;
    setSubmissionsLoading(true);
    const targetPage = reset ? 0 : submissionsPage;
    try {
      const response = await getSubmissions(assignmentId, targetPage, 10);
      if (reset) {
        setSubmissions(response.contents);
        setSubmissionsPage(1);
        setSubmissionsTotal(response.totalElements);
      } else {
        setSubmissions((prev) => [...prev, ...response.contents]);
        setSubmissionsPage((prev) => prev + 1);
      }
      setSubmissionsHasMore(response.currentPage < response.totalPages - 1);
    } catch (error) {
      handleError(error, "Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Load submissions only after assignment detail succeeds
  useEffect(() => {
    if (assignment) {
      loadSubmissions(true);
    }
  }, [assignment?.id]);

  // --- Handle File Downloads ---
  const triggerDownload = async (fileObjectKey: string) => {
    try {
      const response = (await getDownloadUrl(fileObjectKey)) as any;
      if (response?.downloadUrl) {
        window.open(response.downloadUrl, "_blank");
      } else {
        showSuccess("Download link is opening");
      }
    } catch (error) {
      handleError(error, "Failed to create download link");
    }
  };

  // --- Open Submission Modal & Fetch Detail APIs in Parallel ---
  const openSubmissionDetails = async (submission: SubmissionResponse) => {
    setSelectedSubmission(submission);
    setFeedbacksLoading(true);
    setHistoryLoading(true);
    setHistoryPage(0);
    setHistory([]);
    setHistoryHasMore(true);

    try {
      const [feedbackList, trackingList] = await Promise.all([
        getFeedbacks(assignmentId, submission.studentUsername).catch((e) => {
          console.error("Failed to load feedbacks", e);
          return [];
        }),
        getSubmissionTracking(
          assignmentId,
          submission.studentUsername,
          0,
        ).catch((e) => {
          console.error("Failed to load activity logs", e);
          return null;
        }),
      ]);

      setFeedbacks(feedbackList);
      if (trackingList) {
        setHistory(trackingList.contents);
        setHistoryHasMore(
          trackingList.currentPage < trackingList.totalPages - 1,
        );
      }
    } catch (err) {
      handleError(err, "Failed to load submission details");
    } finally {
      setFeedbacksLoading(false);
      setHistoryLoading(false);
    }
  };

  // --- Submissions Feedback Submission ---
  const handleAddFeedback = async (text: string) => {
    if (!selectedSubmission) return;
    try {
      const created = await createFeedback({
        assignmentId,
        studentUsername: selectedSubmission.studentUsername,
        feedback: text,
      });
      setFeedbacks((prev) => [...prev, created]);
      showSuccess("Successfully added feedback");

      // Refetch history tracking to capture feedback event
      const trackingList = await getSubmissionTracking(
        assignmentId,
        selectedSubmission.studentUsername,
        0,
      );
      if (trackingList) {
        setHistory(trackingList.contents);
        setHistoryPage(0);
        setHistoryHasMore(
          trackingList.currentPage < trackingList.totalPages - 1,
        );
      }
    } catch (error) {
      handleError(error, "Failed to add feedback");
      throw error;
    }
  };

  // --- Delete Submissions Feedback ---
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteFeedback(feedbackId);
      setFeedbacks((prev) => prev.filter((item) => item.id !== feedbackId));
      showSuccess("Successfully deleted feedback");

      // Refetch history tracking to log deletion
      if (selectedSubmission) {
        const trackingList = await getSubmissionTracking(
          assignmentId,
          selectedSubmission.studentUsername,
          0,
        );
        if (trackingList) {
          setHistory(trackingList.contents);
          setHistoryPage(0);
          setHistoryHasMore(
            trackingList.currentPage < trackingList.totalPages - 1,
          );
        }
      }
    } catch (error) {
      handleError(error, "Failed to delete feedback");
      throw error;
    }
  };

  // --- Activity History Pagination ---
  const loadMoreHistory = async () => {
    if (historyLoading || !historyHasMore || !selectedSubmission) return;
    setHistoryLoading(true);
    const nextPage = historyPage + 1;
    try {
      const response = await getSubmissionTracking(
        assignmentId,
        selectedSubmission.studentUsername,
        nextPage,
      );
      setHistory((prev) => [...prev, ...response.contents]);
      setHistoryPage(nextPage);
      setHistoryHasMore(response.currentPage < response.totalPages - 1);
    } catch (error) {
      handleError(error, "Failed to load more history");
    } finally {
      setHistoryLoading(false);
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 1. Elegant Breadcrumbs Navigation */}
      <Breadcrumbs
        separator={<ChevronRight size={14} style={{ color: "#94a3b8" }} />}
        sx={{
          mb: 3,
          "& .MuiBreadcrumbs-li": {
            fontSize: "0.875rem",
            fontWeight: 500,
          },
        }}
      >
        <Link
          href="/lecturer"
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors gap-1.5"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Home size={14} />
          <span>Dashboard</span>
        </Link>
        <Link
          href={`/lecturer/courses/${courseId}`}
          className="text-slate-500 hover:text-slate-900 transition-colors"
          style={{ textDecoration: "none" }}
        >
          {courseTitle}
        </Link>
        <Link
          href={`/lecturer/courses/${courseId}/lectures/${lectureId}`}
          className="text-slate-500 hover:text-slate-900 transition-colors"
          style={{ textDecoration: "none" }}
        >
          {lectureTitle}
        </Link>
        <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
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
          mb: 4,
          position: "sticky",
          top: 0,
          bgcolor: "background.default",
          zIndex: 10,
          pt: 1,
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
