"use client";

import { ErrorState } from "@/components/common/error-state";
import { useDashboardMetrics } from "@/lib/api/metrics";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Users,
  Video,
} from "lucide-react";
import { useEffect } from "react";

export function KpiCards() {
  const { handleError } = useApiWithToast();
  const { data, isLoading, error, refetch } = useDashboardMetrics();

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load dashboard metrics");
    }
  }, [error, handleError]);

  if (error) {
    return (
      <ErrorState
        title="Failed to load dashboard metrics"
        subtitle={
          error.message || "An error occurred while connecting to the server."
        }
        onRetry={refetch}
      />
    );
  }

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: 7 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                border: "1px solid rgba(15, 23, 42, 0.08)",
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: 1,
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Skeleton variant="rounded" width={32} height={32} />
                    <Skeleton width="50%" height={20} />
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Skeleton width="40%" height={32} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  const kpis = [
    {
      title: "Total Users",
      value: data?.totalUsers?.toLocaleString() ?? "0",
      subtitle: "Students & instructors",
      icon: Users,
      color: "#3b82f6", // Blue
    },
    {
      title: "Total Courses",
      value: data?.totalCourses?.toLocaleString() ?? "0",
      subtitle: "Active courses",
      icon: BookOpen,
      color: "#10b981", // Green
    },
    {
      title: "Total Lectures",
      value: data?.totalLectures?.toLocaleString() ?? "0",
      subtitle: "Detailed lectures",
      icon: Video,
      color: "#8b5cf6", // Purple
    },
    {
      title: "Total Assignments",
      value: data?.totalAssignments?.toLocaleString() ?? "0",
      subtitle: "Self-study tasks",
      icon: ClipboardList,
      color: "#f59e0b", // Orange
    },
    {
      title: "Total Enrollments",
      value: data?.totalEnrollments?.toLocaleString() ?? "0",
      subtitle: "Course enrollments",
      icon: GraduationCap,
      color: "#ec4899", // Pink
    },
    {
      title: "Total Revenue",
      value: `${data?.totalRevenue?.toLocaleString("vi-VN") ?? "0"} VND`,
      subtitle: "From successful orders",
      icon: CreditCard,
      color: "#06b6d4", // Cyan
    },
    {
      title: "Completion Rate",
      value: `${data?.courseCompletionRate?.toFixed(2) ?? "0"}%`,
      subtitle: "From successful enrollments",
      icon: CheckCircle2,
      color: "#14b8a6", // Teal
    },
  ];

  return (
    <Grid container spacing={2}>
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <Grid key={kpi.title} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Card
              sx={{
                border: "1px solid rgba(15, 23, 42, 0.06)",
                borderRadius: 1,
                boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(8px)",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0px 8px 30px rgba(0, 0, 0, 0.06)",
                },
              }}
            >
              <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2.5,
                        bgcolor: alpha(kpi.color, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: kpi.color,
                      }}
                    >
                      <Icon size={18} strokeWidth={2.2} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {kpi.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {kpi.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "text.primary",
                      fontSize: { xs: "1.5rem", md: "1.75rem" },
                      mt: 0.5,
                    }}
                  >
                    {kpi.value}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
