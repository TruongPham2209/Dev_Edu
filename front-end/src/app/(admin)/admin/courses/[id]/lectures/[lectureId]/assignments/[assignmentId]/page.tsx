"use client";

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
  CourseResponse,
  FeedbackResponse,
  LectureResponse,
  SubmissionLogResponse,
  SubmissionResponse,
} from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Container, Stack } from "@mui/material";
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

  const { handleError, showSuccess } = useApiWithToast();

  // Core Data States
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [lecture, setLecture] = useState<LectureResponse | null>(null);

  // Submissions Paging States
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([]);
  const [submissionsPage, setSubmissionsPage] = useState(0);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsHasMore, setSubmissionsHasMore] = useState(true);

  // Overall Orchestration States
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(false);

  // --- Modal Specific States ---
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionResponse | null>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);

  // History Timelines
  const [history, setHistory] = useState<SubmissionLogResponse[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyHasMore, setHistoryHasMore] = useState(true);

  // --- Initial Data Load (Strict Sequence) ---
  const loadPageData = async () => {
    setPageLoading(true);
    setPageError(false);
    try {
      // 1. Fetch assignment first
      const assignmentData = await getAssignmentById(assignmentId);
      setAssignment(assignmentData);

      // 2. Fetch course and lecture in parallel ONLY after assignment succeeds
      const [courseData, lectureData] = await Promise.all([
        getCourseById(courseId).catch((err) => {
          console.error("Failed to load course details", err);
          return null;
        }),
        getLectureById(lectureId).catch((err) => {
          console.error("Failed to load lecture details", err);
          return null;
        }),
      ]);

      setCourse(courseData);
      setLecture(lectureData);
    } catch (err) {
      setPageError(true);
      handleError(err, "Cannot load assignment details");
    } finally {
      setPageLoading(false);
    }
  };

  // Trigger initial sequence
  useEffect(() => {
    loadPageData();
  }, [assignmentId, lectureId, courseId]);

  // Load Submissions - triggers ONLY after assignment successfully loaded
  const loadSubmissionsList = async (reset = false) => {
    if (submissionsLoading) return;
    setSubmissionsLoading(true);
    const targetPage = reset ? 0 : submissionsPage;

    try {
      const response = await getSubmissions(assignmentId, targetPage, 10);
      if (reset) {
        setSubmissions(response.contents);
        setSubmissionsPage(1);
      } else {
        setSubmissions((prev) => [...prev, ...response.contents]);
        setSubmissionsPage((prev) => prev + 1);
      }
      setSubmissionsHasMore(response.currentPage < response.totalPages - 1);
    } catch (error) {
      handleError(error, "Cannot load student submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Trigger submissions list fetch when assignment becomes available
  useEffect(() => {
    if (assignment) {
      loadSubmissionsList(true);
    }
  }, [assignment?.id]);

  // --- Download Trigger ---
  const triggerDownload = async (fileObjectKey: string) => {
    try {
      const response = (await getDownloadUrl(fileObjectKey)) as any;
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
      handleError(err, "Cannot load feedback and activity history");
    } finally {
      setFeedbacksLoading(false);
      setHistoryLoading(false);
    }
  };

  // --- Submit Feedback (Admin or Lecturer) ---
  const handleAddFeedback = async (text: string) => {
    if (!selectedSubmission) return;
    try {
      const created = await createFeedback({
        assignmentId,
        studentUsername: selectedSubmission.studentUsername,
        feedback: text,
      });
      setFeedbacks((prev) => [...prev, created]);
      showSuccess("Feedback added successfully");

      // Refetch history tracking list to capture the new feedback event
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

  // --- Delete Feedback (ADMIN mode allows deleting ANY feedback card) ---
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteFeedback(feedbackId);
      setFeedbacks((prev) => prev.filter((item) => item.id !== feedbackId));
      showSuccess("Feedback deleted successfully");

      // Refetch history tracking list to record the delete action
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

  // --- Activity Log Infinite Pagination ---
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
      handleError(error, "Cannot load more activity history");
    } finally {
      setHistoryLoading(false);
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
