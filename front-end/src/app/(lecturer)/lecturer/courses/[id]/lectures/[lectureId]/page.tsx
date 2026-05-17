"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
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
  FileText,
  Paperclip,
  ClipboardList,
  Calendar,
  ChevronRight,
  Home,
  BookOpen,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

import { getLectureById } from "@/lib/api/lectures";
import { getCourseById } from "@/lib/api/courses";
import type { LectureResponse, CourseDetailProjection } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { EmptyState } from "@/components/common/empty-state";
import { formatServerDate } from "@/lib/date-utils";

// Tabs
import { MaterialsTab } from "./components/materials-tab";
import { AssignmentsTab } from "./components/assignments-tab";

export default function LecturerLectureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const { handleError } = useApiWithToast();

  const lectureId = params.lectureId as string;
  const courseId = params.id as string;

  // Primary Data State
  const [lecture, setLecture] = useState<LectureResponse | null>(null);
  const [course, setCourse] = useState<CourseDetailProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Synchronized counts for Hero metadata
  const [materialsCount, setMaterialsCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);

  // Tab State
  const [tab, setTab] = useState("overview");

  const loadPageData = async () => {
    setLoading(true);
    setError(false);
    try {
      // Parallel loading for ultimate speed
      const [lectureData, courseData] = await Promise.all([
        getLectureById(lectureId),
        getCourseById(courseId).catch((err) => {
          console.error("Failed to load course details", err);
          return null; // Fallback so page doesn't crash
        }),
      ]);

      setLecture(lectureData);
      setCourse(courseData);
    } catch (err) {
      setError(true);
      handleError(err, "Không thể tải thông tin bài giảng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [lectureId, courseId]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs Skeleton */}
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
          <Skeleton variant="circular" width={20} height={20} />
          <Skeleton variant="text" width={80} height={20} />
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="text" width={120} height={20} />
        </Stack>

        {/* Hero Section Skeleton */}
        <Box
          sx={{
            p: 4,
            borderRadius: 4,
            bgcolor: "grey.900",
            mb: 4,
            height: 220,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Skeleton
              variant="text"
              width="20%"
              height={24}
              sx={{ bgcolor: "grey.800", mb: 1 }}
            />
            <Skeleton
              variant="text"
              width="60%"
              height={40}
              sx={{ bgcolor: "grey.800", mb: 1.5 }}
            />
            <Skeleton
              variant="text"
              width="80%"
              height={24}
              sx={{ bgcolor: "grey.800" }}
            />
          </Box>
          <Stack direction="row" spacing={3}>
            <Skeleton
              variant="text"
              width={120}
              height={24}
              sx={{ bgcolor: "grey.800" }}
            />
            <Skeleton
              variant="text"
              width={100}
              height={24}
              sx={{ bgcolor: "grey.800" }}
            />
            <Skeleton
              variant="text"
              width={100}
              height={24}
              sx={{ bgcolor: "grey.800" }}
            />
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
            width={120}
            height={36}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={120}
            height={36}
            sx={{ borderRadius: 1 }}
          />
          <Skeleton
            variant="rectangular"
            width={120}
            height={36}
            sx={{ borderRadius: 1 }}
          />
        </Stack>

        {/* Main Content Skeleton */}
        <Card variant="outlined" sx={{ borderRadius: 3, p: 3 }}>
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={20} />
        </Card>
      </Container>
    );
  }

  if (error || !lecture) {
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
            <AlertCircle size={40} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mb: 1, color: "#0f172a" }}
            >
              Đã xảy ra lỗi khi tải dữ liệu
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Không thể tìm thấy bài giảng yêu cầu hoặc bạn không có quyền truy
              cập.
            </Typography>
          </Box>
          <Button
            component={Link}
            href={`/lecturer/courses/${courseId}`}
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
            Quay lại Khóa học
          </Button>
        </Stack>
      </Container>
    );
  }

  const courseTitle = course?.title || "Khóa học";

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* 1. Elegant Breadcrumbs */}
      <Breadcrumbs
        separator={<ChevronRight size={14} className="text-slate-400" />}
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
          style={{ textDecoration: "none" }}
        >
          <Home size={15} />
          Dashboard
        </Link>
        <Link
          href={`/lecturer/courses/${courseId}`}
          className="text-slate-500 hover:text-slate-900 transition-colors"
          style={{ textDecoration: "none" }}
        >
          {courseTitle}
        </Link>
        <Typography sx={{ color: "text.primary", fontWeight: 700 }}>
          {lecture.title}
        </Typography>
      </Breadcrumbs>

      {/* 2. Premium Hero Banner */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          mb: 3,
          background: "#ffffff",
          border: "1px solid",
          borderColor: "rgba(148, 163, 184, 0.14)",
          boxShadow: `
      0 10px 40px rgba(15, 23, 42, 0.06),
      0 2px 10px rgba(15, 23, 42, 0.04)
    `,
        }}
      >
        {/* Modern Gradient Header */}
        <Box
          sx={{
            position: "relative",
            px: { xs: 2.5, md: 4 },
            py: { xs: 3, md: 4 },

            // Slightly richer but still soft
            background: `
        linear-gradient(
          135deg,
          #dff7f2 0%,
          #e0f2fe 35%,
          #eef4ff 72%,
          #f8fafc 100%
        )
      `,

            borderBottom: "1px solid rgba(148,163,184,0.10)",
          }}
        >
          {/* Decorative Blurs */}
          <Box
            sx={{
              position: "absolute",
              top: -80,
              right: -60,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "rgba(59,130,246,0.12)",
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              bottom: -100,
              left: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(168,85,247,0.10)",
              filter: "blur(70px)",
              pointerEvents: "none",
            }}
          />

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{
              position: "relative",
              zIndex: 1,
              alignItems: {
                xs: "flex-start",
                md: "center",
              },
              justifyContent: "space-between",
            }}
          >
            {/* Left Content */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {/* Badge */}
              <Stack
                direction="row"
                spacing={1.2}
                sx={{
                  alignItems: "center",
                  mb: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.8,
                    px: 1.5,
                    py: 0.8,
                    borderRadius: 99,
                    bgcolor: "primary.main",
                    color: "white",
                    boxShadow: "0 6px 16px rgba(59,130,246,0.25)",
                  }}
                >
                  <BookOpen size={15} />

                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Bài giảng
                  </Typography>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                  }}
                >
                  {courseTitle}
                </Typography>
              </Stack>

              {/* Title */}
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  fontSize: {
                    xs: "1.8rem",
                    md: "2.8rem",
                  },
                  lineHeight: 1.08,
                  letterSpacing: "-0.05em",
                  color: "grey.900",
                  mb: 2,
                  maxWidth: "900px",
                }}
              >
                {lecture.title}
              </Typography>

              {/* Summary */}
              {lecture.summary && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.8,
                    maxWidth: "760px",
                    fontSize: {
                      xs: "0.96rem",
                      md: "1.04rem",
                    },
                  }}
                >
                  {lecture.summary}
                </Typography>
              )}
            </Box>

            {/* Right Meta Card */}
            <Box
              sx={{
                minWidth: { xs: "100%", md: 240 },
                p: 2.2,
                borderRadius: 1,
                bgcolor: "rgba(255,255,255,0.7)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 8px 30px rgba(15,23,42,0.06)",
              }}
            >
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: 2.5,
                      bgcolor: "primary.50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.main",
                    }}
                  >
                    <Calendar size={16} />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        color: "text.secondary",
                        fontWeight: 600,
                      }}
                    >
                      Ngày tạo
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        color: "grey.900",
                      }}
                    >
                      {formatServerDate(lecture.uploadedAt, "date")}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* 3. Modern Sticky Navigation Tabs */}
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
          value={tab}
          onChange={(_, val) => setTab(val)}
          sx={{
            minHeight: 48,
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
              bgcolor: "primary.main",
            },
          }}
        >
          <Tab
            value="overview"
            icon={<BookOpen size={16} />}
            iconPosition="start"
            label="Chi tiết"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 3,
              minHeight: 48,
              transition: "all 0.2s",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
              },
            }}
          />
          <Tab
            value="materials"
            icon={<Paperclip size={16} />}
            iconPosition="start"
            label={`Tài liệu`}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 3,
              minHeight: 48,
              transition: "all 0.2s",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
              },
            }}
          />
          <Tab
            value="assignments"
            icon={<ClipboardList size={16} />}
            iconPosition="start"
            label={`Bài tập`}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 3,
              minHeight: 48,
              transition: "all 0.2s",
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
              },
            }}
          />
        </Tabs>
      </Box>

      {/* 4. Tab Context Area */}
      <Box sx={{ pb: 6 }}>
        {tab === "overview" && (
          <Card
            variant="outlined"
            sx={{
              borderRadius: 1,
              borderColor: "divider",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.01)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                px: 3,
                py: 2,
                bgcolor: "grey.50",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, color: "#1e293b" }}
              >
                Nội dung chi tiết bài giảng
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              {lecture.content ? (
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.primary",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                    fontSize: "0.975rem",
                  }}
                >
                  {lecture.content}
                </Typography>
              ) : (
                <EmptyState
                  title="Chưa có nội dung bài giảng"
                  subtitle="Bài giảng này hiện chưa được cập nhật chi tiết nội dung."
                  icon={<BookOpen size={40} />}
                />
              )}
            </CardContent>
          </Card>
        )}

        {tab === "materials" && (
          <MaterialsTab
            lectureId={lectureId}
            onCountChange={setMaterialsCount}
          />
        )}

        {tab === "assignments" && (
          <AssignmentsTab
            lectureId={lectureId}
            courseId={courseId}
            onCountChange={setAssignmentsCount}
          />
        )}
      </Box>
    </Container>
  );
}
