"use client";

import { ErrorState } from "@/components/common/error-state";
import {
  useCourseGrowth,
  useRevenueGrowth,
  useUserGrowth,
} from "@/lib/api/metrics";
import { MetricPeriod } from "@/lib/type/enum";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { BarChart3, LineChart, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

// Helper function to format the labels on the X-axis
function formatChartLabel(dateStr: string, period: MetricPeriod): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  switch (period) {
    case "DAILY":
      // 08/05
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    case "WEEKLY":
      // Tuần bắt đầu từ ngày DD/MM
      return (
        "T" +
        date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
      );
    case "MONTHLY":
      // Thg 05
      return date.toLocaleDateString("vi-VN", { month: "short" });
    case "YEARLY":
      // 2026
      return date.getFullYear().toString();
    default:
      return dateStr;
  }
}

// Helper to format values
const formatNumber = (num: number) => num.toLocaleString("vi-VN");

// SKELETON FOR CHARTS
function ChartSkeleton({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Card sx={{ border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Skeleton variant="rounded" width={180} height={32} />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
            height: 260,
            px: 1,
          }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <Box
              key={i}
              sx={{ display: "flex", flexDirection: "column", flex: 1, gap: 1 }}
            >
              <Skeleton
                variant="rounded"
                height={60 + (i % 4) * 50}
                sx={{ width: "100%", borderRadius: "4px 4px 0 0" }}
              />
              <Skeleton width="60%" height={14} sx={{ mx: "auto" }} />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

// 1. USER GROWTH CHART
export function UserGrowthChart() {
  const { handleError } = useApiWithToast();
  const [period, setPeriod] = useState<MetricPeriod>("MONTHLY");
  const { data, isLoading, error, refetch } = useUserGrowth(period);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load user growth data");
    }
  }, [error, handleError]);

  if (error) {
    return (
      <Card
        sx={{ border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <ErrorState
            title="Failed to load user growth chart"
            subtitle={error.message}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <ChartSkeleton
        title="User growth"
        subtitle="Statistics on the number of newly registered users"
      />
    );
  }

  const chartData = data ?? [];
  const maxVal = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <Card
      sx={{
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 3,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.01)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUp size={18} className="text-blue-500" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                User growth
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Statistics on the number of newly registered users
            </Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={period}
            onChange={(_, val) => val && setPeriod(val)}
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                px: 1.5,
                py: 0.5,
              },
            }}
          >
            <ToggleButton value="DAILY">Daily</ToggleButton>
            <ToggleButton value="WEEKLY">Weekly</ToggleButton>
            <ToggleButton value="MONTHLY">Monthly</ToggleButton>
            <ToggleButton value="YEARLY">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {chartData.length === 0 ? (
          <Box
            sx={{
              height: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No growth data
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              height: 260,
              px: 1,
            }}
          >
            {chartData.map((point, index) => {
              const height = Math.max(
                12,
                Math.round((point.count / maxVal) * 240),
              );
              return (
                <Box
                  key={`${point.date}-${index}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Tooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{ display: "block", color: "#94a3b8" }}
                        >
                          {point.date}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          +{formatNumber(point.count)} users
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box
                      sx={{
                        height,
                        borderRadius: "6px 6px 0 0",
                        bgcolor: alpha("#3b82f6", 0.75),
                        border: "1px solid rgba(59, 130, 246, 0.4)",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "#3b82f6",
                          transform: "scaleY(1.03)",
                          cursor: "pointer",
                        },
                      }}
                    />
                  </Tooltip>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      textAlign: "center",
                      color: "text.secondary",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {formatChartLabel(point.date, period)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// 2. COURSE GROWTH CHART
export function CourseGrowthChart() {
  const { handleError } = useApiWithToast();
  const [period, setPeriod] = useState<MetricPeriod>("MONTHLY");
  const { data, isLoading, error, refetch } = useCourseGrowth(period);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load course growth data");
    }
  }, [error, handleError]);

  if (error) {
    return (
      <Card
        sx={{ border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <ErrorState
            title="Failed to load course growth data"
            subtitle={error.message}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <ChartSkeleton
        title="Course growth"
        subtitle="Statistics on the number of newly published courses"
      />
    );
  }

  const chartData = data ?? [];
  const maxVal = Math.max(...chartData.map((d) => d.count), 1);

  return (
    <Card
      sx={{
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 3,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.01)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BarChart3 size={18} className="text-emerald-500" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Course growth
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Statistics on the number of newly published courses
            </Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={period}
            onChange={(_, val) => val && setPeriod(val)}
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                px: 1.5,
                py: 0.5,
              },
            }}
          >
            <ToggleButton value="DAILY">Daily</ToggleButton>
            <ToggleButton value="WEEKLY">Weekly</ToggleButton>
            <ToggleButton value="MONTHLY">Monthly</ToggleButton>
            <ToggleButton value="YEARLY">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {chartData.length === 0 ? (
          <Box
            sx={{
              height: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No growth data
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              height: 260,
              px: 1,
            }}
          >
            {chartData.map((point, index) => {
              const height = Math.max(
                12,
                Math.round((point.count / maxVal) * 240),
              );
              return (
                <Box
                  key={`${point.date}-${index}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Tooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{ display: "block", color: "#94a3b8" }}
                        >
                          {point.date}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          +{formatNumber(point.count)} courses
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box
                      sx={{
                        height,
                        borderRadius: "6px 6px 0 0",
                        bgcolor: alpha("#10b981", 0.75),
                        border: "1px solid rgba(16, 185, 129, 0.4)",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "#10b981",
                          transform: "scaleY(1.03)",
                          cursor: "pointer",
                        },
                      }}
                    />
                  </Tooltip>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      textAlign: "center",
                      color: "text.secondary",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {formatChartLabel(point.date, period)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// 3. REVENUE GROWTH CHART
export function RevenueGrowthChart() {
  const { handleError } = useApiWithToast();
  const [period, setPeriod] = useState<MetricPeriod>("MONTHLY");
  const { data, isLoading, error, refetch } = useRevenueGrowth(period);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load revenue growth data");
    }
  }, [error, handleError]);

  if (error) {
    return (
      <Card
        sx={{ border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <ErrorState
            title="Failed to load revenue growth data"
            subtitle={error.message}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <ChartSkeleton
        title="Revenue growth"
        subtitle="Statistics on the number of newly published courses"
      />
    );
  }

  const chartData = data ?? [];
  const maxVal = Math.max(...chartData.map((d) => d.amount), 1);

  return (
    <Card
      sx={{
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 3,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.01)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
            mb: 4,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <LineChart size={18} className="text-cyan-500" />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Revenue growth
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Revenue growth from completed transactions
            </Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={period}
            onChange={(_, val) => val && setPeriod(val)}
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.75rem",
                px: 1.5,
                py: 0.5,
              },
            }}
          >
            <ToggleButton value="DAILY">Daily</ToggleButton>
            <ToggleButton value="WEEKLY">Weekly</ToggleButton>
            <ToggleButton value="MONTHLY">Monthly</ToggleButton>
            <ToggleButton value="YEARLY">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {chartData.length === 0 ? (
          <Box
            sx={{
              height: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No revenue data
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: { xs: 0.5, sm: 1, md: 1.5 },
              height: 260,
              px: 1,
            }}
          >
            {chartData.map((point, index) => {
              const height = Math.max(
                12,
                Math.round((point.amount / maxVal) * 240),
              );
              return (
                <Box
                  key={`${point.date}-${index}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <Tooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography
                          variant="caption"
                          sx={{ display: "block", color: "#94a3b8" }}
                        >
                          {point.date}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          +{formatNumber(point.amount)} VND
                        </Typography>
                      </Box>
                    }
                    arrow
                    placement="top"
                  >
                    <Box
                      sx={{
                        height,
                        borderRadius: "6px 6px 0 0",
                        bgcolor: alpha("#06b6d4", 0.75),
                        border: "1px solid rgba(6, 182, 212, 0.4)",
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "#06b6d4",
                          transform: "scaleY(1.03)",
                          cursor: "pointer",
                        },
                      }}
                    />
                  </Tooltip>
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 1,
                      textAlign: "center",
                      color: "text.secondary",
                      fontSize: "0.7rem",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {formatChartLabel(point.date, period)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// MAIN EXPORT COMBINING THE THREE CHARTS IN RESPONSIVE GRID
export function GrowthCharts() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 6 }}>
        <UserGrowthChart />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <CourseGrowthChart />
      </Grid>
      <Grid size={{ xs: 12, lg: 6 }}>
        <RevenueGrowthChart />
      </Grid>
    </Grid>
  );
}
