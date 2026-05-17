"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  Container,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
  alpha,
  Breadcrumbs,
} from "@mui/material";
import {
  ChevronRight,
  Home,
  ArrowLeft,
  AlertCircle,
  FileText,
  Info,
  Users,
  FileCode,
  Paperclip,
} from "lucide-react";

import {
  getAssignmentById,
  getSubmissions,
  getSubmissionTracking,
  getFeedbacks,
  createFeedback,
  deleteFeedback,
} from "@/lib/api/assignments";
import { getDownloadUrl, getFileMetadata } from "@/lib/api/files";
import { getLectureById } from "@/lib/api/lectures";
import { getCourseById } from "@/lib/api/courses";
import type {
  AssignmentResponse,
  SubmissionResponse,
  SubmissionLogResponse,
  FeedbackResponse,
  LectureResponse,
  FileUploadResponse,
} from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/date-utils";

// Modular Sub-components
import { AssignmentHero } from "./components/assignment-hero";
import { AssignmentOverview } from "./components/assignment-overview";
import { SubmissionsTable } from "./components/submissions-table";
import { SubmissionDetailsModal } from "./components/submission-details-modal";

export default function LecturerAssignmentDetailPage() {
  const params = useParams();
  const theme = useTheme();
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
  const [fileMetadata, setFileMetadata] = useState<FileUploadResponse | null>(
    null,
  );
  const [fileMetadataLoading, setFileMetadataLoading] = useState(false);

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
      handleError(err, "Không thể tải thông tin chi tiết bài tập");
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
      handleError(error, "Không thể tải danh sách bài nộp");
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
        showSuccess("Link tải tệp đang được mở");
      }
    } catch (error) {
      handleError(error, "Không thể tạo link tải tệp tin");
    }
  };

  // --- Open Submission Modal & Fetch Detail APIs in Parallel ---
  const openSubmissionDetails = async (submission: SubmissionResponse) => {
    setSelectedSubmission(submission);
    setFileMetadataLoading(true);
    setFeedbacksLoading(true);
    setHistoryLoading(true);
    setHistoryPage(0);
    setHistory([]);
    setHistoryHasMore(true);

    try {
      const [metadata, feedbackList, trackingList] = await Promise.all([
        getFileMetadata(submission.fileObjectKey).catch((e) => {
          console.error("Failed to load file metadata", e);
          return null;
        }),
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

      setFileMetadata(metadata);
      setFeedbacks(feedbackList);
      if (trackingList) {
        setHistory(trackingList.contents);
        setHistoryHasMore(
          trackingList.currentPage < trackingList.totalPages - 1,
        );
      }
    } catch (err) {
      handleError(err, "Không thể tải thông tin chi tiết bài nộp");
    } finally {
      setFileMetadataLoading(false);
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
      showSuccess("Đã thêm phản hồi và nhận xét");

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
      handleError(error, "Không thể thêm phản hồi");
      throw error;
    }
  };

  // --- Delete Submissions Feedback ---
  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteFeedback(feedbackId);
      setFeedbacks((prev) => prev.filter((item) => item.id !== feedbackId));
      showSuccess("Đã xóa phản hồi");

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
      handleError(error, "Không thể xóa phản hồi");
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
      handleError(error, "Không thể tải thêm lịch sử");
    } finally {
      setHistoryLoading(false);
    }
  };

  // --- Helpers for Formatting ---
  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === null) return "0 B";
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileNameFromKey = (key: string) => {
    if (!key) return "Tệp đính kèm";
    return key.split("/").pop() || key;
  };

  const getFileIcon = (fileName?: string) => {
    if (!fileName) return <FileText size={22} />;
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText size={22} style={{ color: "#ef4444" }} />;
      case "zip":
      case "rar":
      case "7z":
      case "tar":
      case "gz":
        return <FileCode size={22} style={{ color: "#d97706" }} />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "webp":
      case "svg":
        return <Paperclip size={22} style={{ color: "#16a34a" }} />;
      case "doc":
      case "docx":
      case "odt":
        return <FileText size={22} style={{ color: "#2563eb" }} />;
      default:
        return <FileText size={22} style={{ color: "#64748b" }} />;
    }
  };

  // --- SKELETON LOADER STATE (Avoids Layout Shift) ---
  if (pageLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs Skeleton */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
          <Skeleton variant="circular" width={16} height={16} />
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width={120} height={20} />
          <Skeleton variant="text" width={150} height={20} />
        </Stack>

        {/* Hero Banner Skeleton */}
        <Box
          sx={{
            p: 4,
            borderRadius: 1,
            bgcolor: "grey.100",
            mb: 4,
            height: 200,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Skeleton variant="text" width="15%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="50%" height={38} sx={{ mb: 1.5 }} />
            <Skeleton variant="text" width="70%" height={24} />
          </Box>
          <Stack direction="row" spacing={3}>
            <Skeleton variant="text" width={110} height={24} />
            <Skeleton variant="text" width={90} height={24} />
          </Stack>
        </Box>

        {/* Tabs Skeleton */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 4, borderBottom: 1, borderColor: "divider", pb: 1 }}
        >
          <Skeleton
            variant="rectangular"
            width={140}
            height={36}
            sx={{ borderRadius: 1.5 }}
          />
          <Skeleton
            variant="rectangular"
            width={140}
            height={36}
            sx={{ borderRadius: 1.5 }}
          />
        </Stack>

        {/* Content Skeleton */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: 3,
            border: "1px solid rgba(148, 163, 184, 0.14)",
          }}
        >
          <Skeleton variant="text" width="25%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="98%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={20} />
        </Card>
      </Container>
    );
  }

  // --- ERROR FALLBACK STATE ---
  if (pageError || !assignment) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <Stack spacing={3} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: "error.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <AlertCircle size={38} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mb: 1, color: "#0f172a" }}
            >
              Không thể tải thông tin bài tập
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Tài nguyên này có thể không tồn tại, đã bị xóa hoặc tài khoản của
              bạn không có quyền truy cập.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/lecturer"
            variant="contained"
            startIcon={<ArrowLeft size={16} />}
            sx={{
              borderRadius: 2.5,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 1,
            }}
          >
            Quay lại Dashboard
          </Button>
        </Stack>
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
      <AssignmentHero
        assignment={assignment}
        lectureTitle={lectureTitle}
        submissionsTotal={submissionsTotal}
        formatServerDate={formatServerDate}
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
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 48,
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: "success.main",
            },
          }}
        >
          <Tab
            value="overview"
            icon={<Info size={16} />}
            iconPosition="start"
            label="Tổng quan"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 3,
              minHeight: 48,
              transition: "all 0.2s",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "success.main",
              },
            }}
          />
          <Tab
            value="submissions"
            icon={<Users size={16} />}
            iconPosition="start"
            label={`Bài nộp`}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 3,
              minHeight: 48,
              transition: "all 0.2s",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "success.main",
              },
            }}
          />
        </Tabs>
      </Box>

      {/* 4. Tab Context Area */}
      <Box sx={{ pb: 6 }}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <AssignmentOverview
            assignment={assignment}
            triggerDownload={triggerDownload}
          />
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
      <SubmissionDetailsModal
        open={Boolean(selectedSubmission)}
        onClose={() => setSelectedSubmission(null)}
        selectedSubmission={selectedSubmission}
        assignmentId={assignmentId}
        fileMetadata={fileMetadata}
        fileMetadataLoading={fileMetadataLoading}
        feedbacks={feedbacks}
        feedbacksLoading={feedbacksLoading}
        onAddFeedback={handleAddFeedback}
        onDeleteFeedback={handleDeleteFeedback}
        history={history}
        historyLoading={historyLoading}
        historyHasMore={historyHasMore}
        onLoadMoreHistory={loadMoreHistory}
        triggerDownload={triggerDownload}
        formatServerDate={formatServerDate}
        getFileNameFromKey={getFileNameFromKey}
        getFileIcon={getFileIcon}
        formatBytes={formatBytes}
      />
    </Container>
  );
}
