"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Breadcrumbs,
  Chip,
  Avatar,
  Stack,
  useTheme,
} from "@mui/material";
import {
  ChevronRight,
  BookOpen,
  Users,
  Percent,
  GraduationCap,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { formatServerDate } from "@/lib/date-utils";
import type { CourseResponse } from "@/lib/api/types";
import { MetricItem } from "@/components/common/metric-item";
import Image from "next/image";

interface CourseHeroProps {
  course: CourseResponse;
  lecturesCount: number;
  studentsCount: number;
  discountsCount: number;
  lecturersCount: number;
}

export const CourseHero = ({
  course,
  lecturesCount,
  studentsCount,
  discountsCount,
  lecturersCount,
}: CourseHeroProps) => {
  const theme = useTheme();

  const hasDiscount =
    course.discountedPrice !== null &&
    course.originalPrice !== null &&
    course.discountedPrice < course.originalPrice;

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      {/* Modern Compact Breadcrumbs */}
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
              Manage Course
            </span>
          </Link>
          <Typography
            color="text.primary"
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              maxWidth: 250,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {course.title}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Main Course Info Card */}
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 1,
          border: "1px solid rgba(255,255,255,0.7)",
          background: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.92) 0%,
              rgba(248, 250, 252, 0.96) 100%
            )
          `,
          backdropFilter: "blur(20px)",
          boxShadow: `
            0 10px 40px rgba(15,23,42,0.06),
            0 2px 8px rgba(15,23,42,0.04)
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            top: -120,
            right: -120,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)",
          },
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            {/* Thumbnail */}
            <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 1,
                  overflow: "hidden",
                  aspectRatio: "16/12",
                  boxShadow: "0 8px 24px -8px rgba(15, 23, 42, 0.2)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  bgcolor: "rgba(37, 99, 235, 0.04)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 25vw"
                    priority
                    className="object-cover"
                  />
                ) : (
                  <BookOpen size={48} className="text-blue-500 opacity-60" />
                )}
              </Box>
            </Grid>

            {/* Course Title and Info */}
            <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Chip
                    label="Course"
                    size="small"
                    sx={{
                      height: 34,
                      px: 1,
                      borderRadius: "999px",
                      bgcolor: "rgba(37,99,235,0.1)",
                      color: "#2563eb",
                      fontWeight: 800,
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(37,99,235,0.15)",
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.75,
                      py: 0.8,
                      borderRadius: "999px",
                      bgcolor: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.15)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#10b981",
                        boxShadow: "0 0 12px #10b981",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: "#059669",
                      }}
                    >
                      Active
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: "-1.2px",
                    lineHeight: 1.05,
                    color: "#0f172a",
                    maxWidth: "90%",
                    fontSize: {
                      xs: "2rem",
                      md: "2.6rem",
                    },
                  }}
                >
                  {course.title}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 2, sm: 4 }}
                  divider={
                    <Box
                      sx={{
                        width: { xs: 1, sm: "1px" },
                        height: { xs: "1px", sm: "24px" },
                        bgcolor: "divider",
                        alignSelf: "center",
                      }}
                    />
                  }
                  sx={{ pt: 1 }}
                >
                  {/* Prices */}
                  <Stack
                    component="div"
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <DollarSign size={16} className="text-slate-500" />
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {hasDiscount ? (
                        <Stack
                          component="div"
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "baseline" }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 900,
                              color: "#ef4444",
                              fontSize: "1.4rem",
                              letterSpacing: "-0.5px",
                            }}
                          >
                            {course.discountedPrice?.toLocaleString()} VND
                          </Typography>
                          <Typography
                            sx={{
                              textDecoration: "line-through",
                              color: "text.secondary",
                              fontWeight: 600,
                            }}
                          >
                            {course.originalPrice?.toLocaleString()} VND
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography
                          sx={{ fontWeight: 800, color: "text.primary" }}
                        >
                          {course.originalPrice !== null &&
                          course.originalPrice > 0
                            ? `${course.originalPrice.toLocaleString()} VND`
                            : "Miễn phí"}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

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
                      Created at: {formatServerDate(course.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Course Description */}
      <Card
        sx={{
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid rgba(15,23,42,0.06)",
          background: "rgba(255,255,255,0.88)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 30px rgba(15,23,42,0.04)",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3 },
            "&:last-child": { pb: { xs: 2.5, md: 3 } },
          }}
        >
          <Box
            sx={{
              display: "flex",
              mb: 3,
              borderBottom: "1px solid",
              borderColor: "rgba(15,23,42,0.06)",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1.5,
                pb: 1.5,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: -1, // align exactly over the border
                  left: 0,
                  width: "100%",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  bgcolor: "#2563eb",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: "rgba(37,99,235,0.08)",
                  color: "#2563eb",
                }}
              >
                <FileText size={20} />
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                }}
              >
                Course Details
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              "& img": { maxWidth: "100%", height: "auto", borderRadius: 1 },
              "& p": {
                mt: 0,
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.secondary",
                fontSize: "0.95rem",
              },
              "& ul, & ol": {
                mt: 0,
                mb: 1.5,
                pl: 3,
                color: "text.secondary",
                fontSize: "0.95rem",
              },
              "& h1, & h2, & h3, & h4, & h5, & h6": {
                color: "text.primary",
                fontWeight: 600,
                mt: 3,
                mb: 1.5,
              },
              "& a": { color: "primary.main", textDecoration: "none" },
              "& a:hover": { textDecoration: "underline" },
            }}
            dangerouslySetInnerHTML={{ __html: course.description || "" }}
          />
        </CardContent>
      </Card>

      {/* Metrics Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricItem
            title="Total Lectures"
            value={lecturesCount}
            icon={BookOpen}
            color="rgb(37, 99, 235)"
            bg="rgba(37, 99, 235, 0.08)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricItem
            title="Enrolled Students"
            value={studentsCount}
            icon={Users}
            color="rgb(16, 185, 129)"
            bg="rgba(16, 185, 129, 0.08)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricItem
            title="Discount Schedules"
            value={discountsCount}
            icon={Percent}
            color="rgb(245, 158, 11)"
            bg="rgba(245, 158, 11, 0.08)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricItem
            title="Assigned Lecturers"
            value={lecturersCount}
            icon={GraduationCap}
            color="rgb(139, 92, 246)"
            bg="rgba(139, 92, 246, 0.08)"
          />
        </Grid>
      </Grid>
    </Stack>
  );
};
