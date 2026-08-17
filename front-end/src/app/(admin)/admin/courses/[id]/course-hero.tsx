"use client";

import { CourseHeroInfo } from "@/components/common/hero-section/course-hero-info";
import { MetricItem } from "@/components/common/hero-section/metric-item";
import { CourseResponse } from "@/lib/type/courses";
import {
  Box,
  Breadcrumbs,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  BookOpen,
  ChevronRight,
  FileText,
  GraduationCap,
  Percent,
  Users,
} from "lucide-react";
import Link from "next/link";

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
              Manage Course
            </span>
          </Link>
          <Typography
            color="text.primary"
            title={course.title}
            sx={{
              fontSize: "0.875rem",
              fontWeight: 600,
              maxWidth: { xs: 180, sm: 280, md: 450 },
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
            width: { xs: 160, sm: 260 },
            height: { xs: 160, sm: 260 },
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)",
          },
        }}
      >
        <CourseHeroInfo course={course} />
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
            p: { xs: 2, sm: 2.5, md: 3 },
            "&:last-child": { pb: { xs: 2, sm: 2.5, md: 3 } },
          }}
        >
          <Box
            sx={{
              display: "flex",
              mb: { xs: 2, sm: 3 },
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
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                Course Details
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              overflowX: "auto",
              wordBreak: "break-word",
              "& img": { maxWidth: "100%", height: "auto", borderRadius: 1 },
              "& p": {
                mt: 0,
                mb: 1.5,
                lineHeight: 1.6,
                color: "text.secondary",
                fontSize: { xs: "0.875rem", sm: "0.95rem" },
              },
              "& ul, & ol": {
                mt: 0,
                mb: 1.5,
                pl: 3,
                color: "text.secondary",
                fontSize: { xs: "0.875rem", sm: "0.95rem" },
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
      <Grid container spacing={{ xs: 2, sm: 3 }}>
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
