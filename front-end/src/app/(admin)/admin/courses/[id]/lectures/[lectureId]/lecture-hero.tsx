"use client";

import { LectureHeroInfo } from "@/components/common/hero-section/lecture-hero-info";
import { MetricItem } from "@/components/common/hero-section/metric-item";
import { getDownloadUrl } from "@/lib/api/files";
import type { LectureResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
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
import { useState } from "react";

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
  const { handleError } = useApiWithToast();

  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handlePlayVideo = async () => {
    if (!lecture.videoObjectKey) return;
    setLoadingVideo(true);
    try {
      const res = await getDownloadUrl(lecture.videoObjectKey);
      const downloadUrl = res.downloadUrl || res.publicUrl;
      if (downloadUrl) {
        setVideoUrl(downloadUrl);
      } else {
        throw new Error("Could not generate video link");
      }
    } catch (err) {
      handleError(err, "Could not load video");
    } finally {
      setLoadingVideo(false);
    }
  };

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
          separator={<ChevronRight size={14} className="text-slate-400" />}
          aria-label="breadcrumb"
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
              className="hover:text-blue-600 transition-colors"
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
            <span
              style={{
                cursor: "pointer",
                maxWidth: 200,
                display: "inline-block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                verticalAlign: "middle",
              }}
              className="hover:text-blue-600 transition-colors"
            >
              {courseTitle}
            </span>
          </Link>
          <Typography
            color="text.primary"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              maxWidth: 220,
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
      <Grid container spacing={3}>
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
