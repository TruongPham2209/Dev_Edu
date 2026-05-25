"use client";

import { MetricItem } from "@/components/common/metric-item";
import { getDownloadUrl } from "@/lib/api/files";
import type { LectureResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/date-utils";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  Play,
  Video,
} from "lucide-react";
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
      <Card
        sx={{
          borderRadius: 2,
          border: "1px solid rgba(15, 23, 42, 0.08)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)",
          boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            {/* Video Preview / Thumbnail Area */}
            <Grid size={{ xs: 12, md: 5, lg: 4.5 }}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2.5,
                  overflow: "hidden",
                  aspectRatio: "16/9",
                  boxShadow: "0 12px 24px -10px rgba(15, 23, 42, 0.25)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  bgcolor: "#0f172a", // Dark background for video container
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {!lecture.videoObjectKey ? (
                  // No Video Attached
                  <Stack
                    spacing={1.5}
                    sx={{ alignItems: "center", color: "slate.400" }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Video size={24} style={{ color: "#94a3b8" }} />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#94a3b8", fontWeight: 600 }}
                    >
                      No video uploaded
                    </Typography>
                  </Stack>
                ) : videoUrl ? (
                  // Native HTML5 Video Player
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  // Interactive Poster (Click to load presigned URL)
                  <Box
                    onClick={loadingVideo ? undefined : handlePlayVideo}
                    sx={{
                      width: "100%",
                      height: "100%",
                      cursor: loadingVideo ? "default" : "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: loadingVideo ? "none" : "scale(1.02)",
                      },
                    }}
                  >
                    {/* Glowing Play Button */}
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 20px rgba(37, 99, 235, 0.6)",
                        transition: "all 0.2s ease",
                        mb: 1.5,
                        zIndex: 2,
                        "&:hover": {
                          bgcolor: "primary.dark",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      {loadingVideo ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <Play
                          size={26}
                          fill="currentColor"
                          style={{ marginLeft: 3 }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "white",
                        fontWeight: 700,
                        zIndex: 2,
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                      }}
                    >
                      {loadingVideo ? "Loading video..." : "Click to play"}
                    </Typography>
                    {/* Shadow overlay gradient */}
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        bg: "linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.8) 100%)",
                        zIndex: 1,
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Title, description and controls */}
            <Grid size={{ xs: 12, md: 7, lg: 7.5 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label="Lecture"
                      size="small"
                      sx={{
                        bgcolor: "rgba(37, 99, 235, 0.08)",
                        color: "#2563eb",
                        fontWeight: 700,
                        borderRadius: 1.5,
                        border: "1px solid rgba(37, 99, 235, 0.12)",
                      }}
                    />
                    <Chip
                      label="Management"
                      size="small"
                      sx={{
                        bgcolor: "rgba(100, 116, 139, 0.08)",
                        color: "#475569",
                        fontWeight: 700,
                        borderRadius: 1.5,
                        border: "1px solid rgba(100, 116, 139, 0.12)",
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 850,
                    color: "text.primary",
                    letterSpacing: "-0.5px",
                    lineHeight: 1.2,
                  }}
                >
                  {lecture.title}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.6,
                    maxHeight: 60,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {lecture.summary || "No summary for this lecture."}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 2, sm: 4 }}
                  divider={
                    <Box
                      sx={{
                        width: { xs: 1, sm: "1px" },
                        height: { xs: "1px", sm: "20px" },
                        bgcolor: "divider",
                        alignSelf: "center",
                      }}
                    />
                  }
                  sx={{ pt: 1 }}
                >
                  {/* Created At */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <Calendar size={16} className="text-slate-500" />
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontWeight: 550 }}
                    >
                      Uploaded at:{" "}
                      {formatServerDate(lecture.uploadedAt, "datetime")}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
