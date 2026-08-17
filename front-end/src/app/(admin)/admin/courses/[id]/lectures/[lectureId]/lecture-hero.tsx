"use client";

import { LectureHeroInfo } from "@/components/common/hero-section/lecture-hero-info";
import { MetricItem } from "@/components/common/hero-section/metric-item";
import { LectureResponse } from "@/lib/type/lectures";
import {
  Box,
  Breadcrumbs,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { ChevronRight, ClipboardList, Clock, FileText } from "lucide-react";
import Link from "next/link";

interface LectureHeroSectionProps {
  lecture: LectureResponse;
  courseId: string;
  courseTitle?: string;
  materialsCount: number;
  assignmentsCount: number;
}

export function LectureHeroSection({
  lecture,
  courseId,
  courseTitle = "Course",
  materialsCount,
  assignmentsCount,
}: LectureHeroSectionProps) {
  const theme = useTheme();

  const formatDuration = (seconds: number | undefined | null) => {
    if (!seconds) return "N/A";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const durationText = formatDuration(lecture.duration);

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      {/* 1. Elegant Compact Breadcrumbs */}
      <Box sx={{ py: 0.5 }}>
        <Breadcrumbs
          separator={<ChevronRight size={14} className="text-slate-400 shrink-0" />}
          aria-label="breadcrumb"
          sx={{
            "& .MuiBreadcrumbs-ol": {
              alignItems: "center",
              flexWrap: "nowrap",
              overflow: "hidden",
            },
            "& .MuiBreadcrumbs-li": {
              display: "inline-flex",
              alignItems: "center",
              minWidth: 0,
            },
            "& .MuiBreadcrumbs-separator": {
              mx: { xs: 0.5, sm: 1 },
              flexShrink: 0,
            },
          }}
        >
          <Link
            href="/admin/courses"
            style={{
              textDecoration: "none",
              color: theme.palette.text.secondary,
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <span
              style={{ cursor: "pointer" }}
              className="hover:text-blue-600 transition-colors shrink-0"
            >
              Course Management
            </span>
          </Link>
          <Link
            href={`/admin/courses/${courseId}`}
            style={{
              textDecoration: "none",
              color: theme.palette.text.secondary,
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            <Typography
              component="span"
              title={courseTitle}
              sx={{
                cursor: "pointer",
                maxWidth: { xs: 100, sm: 180, md: 250 },
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                verticalAlign: "middle",
                fontSize: "0.875rem",
                fontWeight: 500,
                color: "inherit",
                "&:hover": { color: "primary.main" },
              }}
            >
              {courseTitle}
            </Typography>
          </Link>
          <Typography
            color="text.primary"
            title={lecture.title}
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              maxWidth: { xs: 120, sm: 220, md: 380 },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {lecture.title}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* 2. Main Lecture Hero Card */}
      <LectureHeroInfo lecture={lecture} />

      {/* 3. Metrics Row */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricItem
            title="Estimated duration"
            value={lecture.videoObjectKey ? durationText : "N/A"}
            icon={Clock}
            color="rgb(37, 99, 235)"
            bg="rgba(37, 99, 235, 0.08)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricItem
            title="Attached materials"
            value={`${materialsCount} materials`}
            icon={FileText}
            color="rgb(16, 185, 129)"
            bg="rgba(16, 185, 129, 0.08)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <MetricItem
            title="Essay Assignments"
            value={`${assignmentsCount} assignments`}
            icon={ClipboardList}
            color="rgb(139, 92, 246)"
            bg="rgba(139, 92, 246, 0.08)"
          />
        </Grid>
      </Grid>
    </Stack>
  );
}
