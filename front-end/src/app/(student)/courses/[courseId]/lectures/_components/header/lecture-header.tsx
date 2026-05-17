"use client";

import {
  Box,
  Breadcrumbs,
  Link,
  Typography,
  Stack,
  Chip,
  alpha,
  useTheme,
} from "@mui/material";
import { ChevronRight, Clock, CheckCircle2, Lock } from "lucide-react";
import NextLink from "next/link";
import { LectureResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/date-utils";

interface LectureHeaderProps {
  lecture: LectureResponse;
  courseTitle?: string;
  courseId: string;
}

export function LectureHeader({
  lecture,
  courseTitle,
  courseId,
}: LectureHeaderProps) {
  const theme = useTheme();

  return (
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
          Khóa học
        </Link>
        <Link
          component={NextLink}
          underline="hover"
          color="inherit"
          href={`/courses/${courseId}`}
          sx={{ fontSize: "0.875rem" }}
        >
          {courseTitle || "Chi tiết khóa học"}
        </Link>
        <Typography
          color="text.primary"
          sx={{ fontSize: "0.875rem", fontWeight: 500 }}
        >
          {lecture.title}
        </Typography>
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
              label="Hoàn thành"
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
              label="Đang học"
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
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ color: "text.secondary", alignItems: "center" }}
          >
            <Clock size={14} />
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              15 phút
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ color: "text.secondary", alignItems: "center" }}
          >
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Cập nhật: {formatServerDate(lecture.uploadedAt)}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
