import {
  Box,
  Card,
  CardContent,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import type { CourseResponse } from "@/lib/api/types";
import { parseServerDate } from "@/lib/util/date-utils";

type RevenuePoint = {
  label: string;
  value: number;
};

export function RevenueAnalytics({ courses }: { courses: CourseResponse[] }) {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">(
    "monthly",
  );

  const now = Date.now();
  const revenueSeries = useMemo(() => {
    if (period === "weekly") {
      const points: RevenuePoint[] = [];
      for (let i = 6; i >= 0; i -= 1) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const label = date.toLocaleDateString("en-US", { weekday: "short" });
        const value = courses
          .filter((c) => {
            const d = parseServerDate(c.createdAt);
            return (
              d.getDate() === date.getDate() &&
              d.getMonth() === date.getMonth() &&
              d.getFullYear() === date.getFullYear()
            );
          })
          .reduce((sum, c) => sum + (c.originalPrice ?? 0), 0);
        points.push({ label, value });
      }
      return points;
    }

    if (period === "yearly") {
      const points: RevenuePoint[] = [];
      for (let i = 11; i >= 0; i -= 1) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const label = date.toLocaleDateString("en-US", { month: "short" });
        const value = courses
          .filter((c) => {
            const d = parseServerDate(c.createdAt);
            return (
              d.getMonth() === date.getMonth() &&
              d.getFullYear() === date.getFullYear()
            );
          })
          .reduce((sum, c) => sum + (c.originalPrice ?? 0), 0);
        points.push({ label, value });
      }
      return points;
    }

    // monthly
    const points: RevenuePoint[] = [];
    for (let i = 3; i >= 0; i -= 1) {
      const start = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
      const end = now - i * 7 * 24 * 60 * 60 * 1000;
      const label = `W${4 - i}`;
      const value = courses
        .filter((c) => {
          const ts = parseServerDate(c.createdAt).getTime();
          return ts >= start && ts < end;
        })
        .reduce((sum, c) => sum + (c.originalPrice ?? 0), 0);
      points.push({ label, value });
    }
    return points;
  }, [period, courses, now]);

  const maxRevenue = Math.max(...revenueSeries.map((point) => point.value), 1);

  return (
    <Card
      sx={{
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background: "rgba(255, 255, 255, 0.9)",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Revenue analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Monitor revenue trends across periods.
            </Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={period}
            onChange={(_, value) =>
              value && setPeriod(value as "weekly" | "monthly" | "yearly")
            }
          >
            <ToggleButton value="weekly">Weekly</ToggleButton>
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="yearly">Yearly</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box
          sx={{
            mt: 4,
            display: "flex",
            alignItems: "flex-end",
            gap: 2,
            height: 200,
          }}
        >
          {revenueSeries.map((point) => {
            const height = Math.max(
              16,
              Math.round((point.value / maxRevenue) * 180),
            );
            return (
              <Box
                key={point.label}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                }}
              >
                <Tooltip title={`${point.value.toLocaleString()} VND`} arrow>
                  <Box
                    sx={{
                      height,
                      borderRadius: 2,
                      bgcolor: alpha("#2563eb", 0.22),
                      border: "1px solid rgba(37, 99, 235, 0.25)",
                    }}
                  />
                </Tooltip>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1,
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  {point.label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
