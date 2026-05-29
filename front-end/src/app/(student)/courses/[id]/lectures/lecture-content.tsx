"use client";

import {
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Home,
} from "lucide-react";
import NextLink from "next/link";
import { LectureResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/util/date-utils";
import { LectureVideoPlayer } from "./lecture-video-player";
import { LectureHTMLContent } from "./lecture-html-content";

interface LectureContentProps {
  lecture: LectureResponse;
  courseId: string;
  prevLecture?: LectureResponse;
  nextLecture?: LectureResponse;
  onSelectLecture: (id: string) => void;
  onNext: () => void;
  navigating: boolean;
  onVideoCompleted: () => void;
}

function displayDuration(seconds: number) {
  if (seconds < 60) {
    return `${seconds} ${seconds === 1 ? "second" : "seconds"}`;
  }

  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(seconds / 3600);
  const remainingSeconds = seconds % 3600;
  const minutes = Math.floor(remainingSeconds / 60);

  return `${hours}h ${minutes}m`;
}

export function LectureContent({
  lecture,
  courseId,
  prevLecture,
  nextLecture,
  onSelectLecture,
  onNext,
  navigating,
  onVideoCompleted,
}: LectureContentProps) {
  const theme = useTheme();

  return (
    <>
      <Stack spacing={1.5}>
        <Breadcrumbs
          separator={<ChevronRight size={14} />}
          aria-label="breadcrumb"
          sx={{
            "& .MuiBreadcrumbs-li": { display: "flex", alignItems: "center" },
          }}
        >
          <Link
            component={NextLink}
            underline="hover"
            color="inherit"
            href="/courses"
            sx={{ fontSize: "0.875rem", display: "flex", alignItems: "center" }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", cursor: "pointer" }}
            >
              <Home size={14} />{" "}
              <Typography variant="caption">Courses</Typography>
            </Stack>
          </Link>
          <Link
            component={NextLink}
            underline="hover"
            color="inherit"
            href={`/courses/${courseId}`}
            sx={{ fontSize: "0.875rem", display: "flex", alignItems: "center" }}
          >
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ alignItems: "center", cursor: "pointer" }}
            >
              <Typography
                color="text.primary"
                sx={{ fontSize: "0.875rem", fontWeight: 500 }}
              >
                {lecture.title}
              </Typography>
            </Stack>
          </Link>
        </Breadcrumbs>

        <Box>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 1, alignItems: "center" }}
          >
            <Typography
              variant="h6"
              component="h1"
              sx={{ fontWeight: 800, letterSpacing: "-0.01em" }}
            >
              {lecture.title}
            </Typography>
            {lecture.isCompleted ? (
              <Chip
                icon={<CheckCircle2 size={14} />}
                label="Completed"
                size="small"
                sx={{
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  color: theme.palette.success.main,
                  fontWeight: 600,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  "& .MuiChip-icon": { color: "inherit" },
                }}
              />
            ) : (
              <Chip
                label="In Progress"
                size="small"
                sx={{
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              />
            )}
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: "800px", lineHeight: 1.5, fontSize: "0.875rem" }}
          >
            {lecture.summary}
          </Typography>

          <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
            {lecture.duration > 0 && (
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ color: "text.secondary", alignItems: "center" }}
              >
                <Clock size={14} />
                <Typography variant="caption" sx={{ fontWeight: 500 }}>
                  {displayDuration(lecture.duration)}
                </Typography>
              </Stack>
            )}
            <Stack
              direction="row"
              spacing={0.5}
              sx={{ color: "text.secondary", alignItems: "center" }}
            >
              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                Updated: {formatServerDate(lecture.uploadedAt)}
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ my: 0.5 }}>
        {lecture.videoObjectKey ? (
          <LectureVideoPlayer
            lectureId={lecture.id}
            videoObjectKey={lecture.videoObjectKey}
            isInitiallyCompleted={lecture.isCompleted || false}
            onCompleted={onVideoCompleted}
          />
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <LectureHTMLContent content={lecture.content || ""} />
          </Paper>
        )}
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ mt: 1.5, justifyContent: "space-between" }}
      >
        <Button
          variant="outlined"
          startIcon={<ChevronLeft size={16} />}
          disabled={!prevLecture}
          onClick={() => prevLecture && onSelectLecture(prevLecture.id)}
          size="small"
          sx={{
            borderRadius: 1,
            px: 2,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          endIcon={
            !nextLecture && (lecture.isCompleted || !lecture.videoObjectKey) ? (
              <CheckCircle2 size={16} />
            ) : (
              <ChevronRight size={16} />
            )
          }
          onClick={onNext}
          disabled={
            navigating || (!!lecture.videoObjectKey && !lecture.isCompleted)
          }
          size="small"
          sx={{
            borderRadius: 1,
            px: 3,
            textTransform: "none",
            fontWeight: 700,
            bgcolor:
              !nextLecture && (lecture.isCompleted || !lecture.videoObjectKey)
                ? "success.main"
                : "primary.main",
            "&:hover": {
              bgcolor:
                !nextLecture && (lecture.isCompleted || !lecture.videoObjectKey)
                  ? "success.dark"
                  : "primary.dark",
            },
          }}
        >
          {navigating
            ? "Processing..."
            : nextLecture
              ? "Next lesson"
              : "Complete course"}
        </Button>
      </Stack>
    </>
  );
}
