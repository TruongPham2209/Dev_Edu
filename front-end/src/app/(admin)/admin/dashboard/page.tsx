"use client";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { useAllAdminCoursesQuery } from "@/lib/api/courses";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate, parseServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { useEffect, useMemo } from "react";
import { DashboardSkeleton } from "./dashboard-skeleton";
import { RevenueAnalytics } from "./revenue-analytics";

type ActivityItem = {
  id: string;
  label: string;
  timestamp: unknown;
  type: "course";
};

export default function AdminDashboard() {
  const { handleError } = useApiWithToast();

  const {
    data: courses = [],
    isLoading: loading,
    error,
    refetch: loadData,
  } = useAllAdminCoursesQuery();

  useEffect(() => {
    if (error) {
      handleError(error, "Không thể tải dữ liệu dashboard");
    }
  }, [error, handleError]);

  const uniqueLecturers = useMemo(() => {
    return Array.from(
      new Set(courses.flatMap((course) => course.lecturers ?? [])),
    );
  }, [courses]);

  const totalRevenue = useMemo(() => {
    return courses.reduce((sum, course) => {
      return sum + (course.originalPrice ?? 0);
    }, 0);
  }, [courses]);

  const cards = [
    {
      title: "Total courses",
      value: courses.length,
      subtitle: "Catalog size",
      icon: BookOpen,
      delta: 6,
    },
    {
      title: "Total lecturers",
      value: uniqueLecturers.length,
      subtitle: "Teaching staff",
      icon: GraduationCap,
      delta: 4,
    },
    {
      title: "Total course value",
      value: totalRevenue.toLocaleString(),
      subtitle: "Sum of prices",
      icon: TrendingUp,
      delta: 0,
    },
  ];

  const activities = useMemo(() => {
    const items: ActivityItem[] = [];
    courses.forEach((course) => {
      items.push({
        id: `course-${course.id}`,
        label: `Course: ${course.title}`,
        timestamp: course.createdAt,
        type: "course",
      });
    });
    return items
      .sort(
        (a, b) =>
          parseServerDate(b.timestamp).getTime() -
          parseServerDate(a.timestamp).getTime(),
      )
      .slice(0, 6);
  }, [courses]);

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Admin analytics overview
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Track system health, revenue, and operational growth signals.
        </Typography>
      </Box>

      {error ? (
        <ErrorState
          title="Cannot load dashboard data"
          subtitle="Error occurred while connecting to server. Please try again."
          onRetry={loadData}
          actionLabel="Retry"
        />
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <Grid container spacing={2}>
            {cards.map((card) => {
              const Icon = card.icon;
              const isPositive = card.delta >= 0;
              return (
                <Grid key={card.title} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Card
                    sx={{
                      border: "1px solid rgba(15, 23, 42, 0.08)",
                      background: "rgba(255, 255, 255, 0.9)",
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 2,
                              bgcolor: alpha("#2563eb", 0.12),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#2563eb",
                            }}
                          >
                            <Icon size={16} />
                          </Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            {card.title}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 1,
                          }}
                        >
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 700, mr: 1 }}
                          >
                            {card.value}
                          </Typography>
                          <ChipDelta delta={card.delta} positive={isPositive} />
                          <Typography variant="caption" color="text.secondary">
                            {card.subtitle}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <RevenueAnalytics courses={courses} />
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card
                sx={{
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  background: "rgba(255, 255, 255, 0.9)",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Recent system activity
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    Latest course activity.
                  </Typography>
                  {activities.length === 0 ? (
                    <EmptyState title="No activity yet" />
                  ) : (
                    <Stack spacing={2}>
                      {activities.map((item, index) => (
                        <Box key={item.id}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                gap: 1.5,
                                alignItems: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 2,
                                  bgcolor: alpha("#2563eb", 0.14),
                                  color: "#2563eb",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Activity size={16} />
                              </Box>
                              <Box>
                                <Typography sx={{ fontWeight: 600 }}>
                                  {item.label}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatServerDate(item.timestamp, "datetime")}
                                </Typography>
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                color: "text.secondary",
                              }}
                            >
                              {index % 2 === 0 ? (
                                <ArrowUpRight size={16} />
                              ) : (
                                <ArrowDownRight size={16} />
                              )}
                            </Box>
                          </Box>
                          {index < activities.length - 1 && (
                            <Divider sx={{ mt: 2 }} />
                          )}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
}

function ChipDelta({ delta, positive }: { delta: number; positive: boolean }) {
  const color = positive ? "#0f766e" : "#b42318";
  const background = positive ? alpha("#10b981", 0.18) : alpha("#f97316", 0.2);
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: 1,
        py: 0.25,
        borderRadius: 999,
        bgcolor: background,
        color,
        fontWeight: 600,
        fontSize: "0.75rem",
      }}
    >
      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {Math.abs(delta)}%
    </Box>
  );
}
