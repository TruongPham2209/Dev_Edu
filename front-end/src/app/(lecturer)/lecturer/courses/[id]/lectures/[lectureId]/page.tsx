"use client";

import { AnimatedTabs } from "@/components/common/animated-tabs";
import { ErrorState } from "@/components/common/error-state";
import { useCourseByIdQuery } from "@/lib/api/courses";
import { useLectureByIdQuery } from "@/lib/api/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Container,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ClipboardList,
  Home,
  MessageCircle,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { LectureDetailSkeleton } from "./lecture-detail-skeleton";

// Tabs
import { LectureHeroInfo } from "@/components/common/hero-section/lecture-hero-info";
import { AssignmentsTab } from "./assignments-tab";
import { MaterialsTab } from "./materials-tab";
import { TabComments } from "./comment-tab";

export default function LecturerLectureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const theme = useTheme();
  const { handleError } = useApiWithToast();

  const lectureId = params.lectureId as string;
  const courseId = params.id as string;

  // React Query queries
  const {
    data: lecture,
    isLoading: lectureLoading,
    error: lectureError,
  } = useLectureByIdQuery(lectureId);
  const { data: course, isLoading: courseLoading } = useCourseByIdQuery(
    courseId,
    { enabled: !!courseId },
  );

  const loading = lectureLoading || courseLoading;
  const error = !!lectureError || (!lectureLoading && !lecture);

  // Synchronized counts for Hero metadata
  const [materialsCount, setMaterialsCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);

  // Tab State
  const [tab, setTab] = useState("overview");

  if (loading) {
    return <LectureDetailSkeleton />;
  }

  if (error || !lecture) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <ErrorState
          title="Failed to load lecture details"
          subtitle="The lecture you are looking for does not exist or you don't have access to it."
          onRetry={() => router.push(`/lecturer/courses/${courseId}`)}
          actionLabel="Back to Course"
          iconAction={<ArrowLeft size={18} />}
        />
      </Container>
    );
  }

  const courseTitle = course?.title || "Course";

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* 1. Elegant Breadcrumbs */}
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
            maxWidth: 130,
            display: "inline-block",
          }}
          title={courseTitle}
        >
          {courseTitle}
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
            maxWidth: { xs: 150, sm: 300, md: "none" },
            display: "inline-block",
          }}
          title={lecture.title}
        >
          {lecture.title}
        </Typography>
      </Breadcrumbs>

      {/* 2. Premium Hero Banner */}
      <LectureHeroInfo lecture={lecture} />

      {/* 3. Modern Sticky Navigation Tabs */}
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
        }}
      >
        <AnimatedTabs
          value={tab}
          onChange={setTab}
          colorTheme="primary"
          tabs={[
            {
              value: "overview",
              label: "Overview",
              icon: <BookOpen size={16} />,
            },
            {
              value: "materials",
              label: "Materials",
              icon: <Paperclip size={16} />,
            },
            {
              value: "assignments",
              label: "Assignments",
              icon: <ClipboardList size={16} />,
            },
            {
              value: "comments",
              label: "Comments",
              icon: <MessageCircle size={16} />,
            },
          ]}
        />
      </Box>

      {/* 4. Tab Context Area */}
      <Box
        sx={{
          pb: 6,
          display: tab === "overview" ? "block" : "none",
        }}
      >
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
                px: { xs: 2, sm: 3 },
                py: { xs: 1.5, sm: 2 },
                bgcolor: "grey.50",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: "primary.50",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                  flexShrink: 0,
                }}
              >
                <BookOpen size={18} />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e293b",
                  fontSize: { xs: "0.95rem", sm: "1rem" },
                }}
              >
                Detailed content
              </Typography>
            </Box>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box
                dangerouslySetInnerHTML={{ __html: lecture.content || "" }}
                sx={{
                  color: "text.primary",
                  lineHeight: 1.8,
                  fontSize: { xs: "0.875rem", sm: "0.975rem" },
                  "& p": {
                    mt: 0,
                    mb: 2,
                    "&:last-of-type": { mb: 0 },
                  },
                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 1,
                    my: 2,
                  },
                  "& h1, & h2, & h3, & h4, & h5, & h6": {
                    mt: 3,
                    mb: 1.5,
                    fontWeight: 700,
                  },
                  "& ul, & ol": {
                    mt: 0,
                    mb: 2,
                    pl: 3,
                  },
                }}
              />
            </CardContent>
          </Card>
        )}
      </Box>

      <Box
        sx={{
          pb: 6,
          display: tab === "materials" ? "block" : "none",
        }}
      >
        <MaterialsTab lectureId={lectureId} onCountChange={setMaterialsCount} />
      </Box>

      <Box
        sx={{
          pb: 6,
          display: tab === "assignments" ? "block" : "none",
        }}
      >
        <AssignmentsTab
          lectureId={lectureId}
          courseId={courseId}
          onCountChange={setAssignmentsCount}
        />
      </Box>

      <Box
        sx={{
          pb: 6,
          display: tab === "comments" ? "block" : "none",
        }}
      >
        <TabComments lectureId={lectureId} />
      </Box>
    </Container>
  );
}
