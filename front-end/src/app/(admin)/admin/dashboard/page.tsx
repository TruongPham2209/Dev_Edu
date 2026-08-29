"use client";

import { Box, Button, Stack, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useState } from "react";
import { ActivityStats } from "./activity-stats";
import { GrowthCharts } from "./growth-charts";
import { KpiCards } from "./kpi-cards";
import { TopRankings } from "./top-rankings";

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshAll = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ["metrics"] });
    } catch (err) {
      console.error("Failed to refresh data:", err);
    } finally {
      // Simulate a small delay for premium visual feedback on the button spinner
      setTimeout(() => {
        setIsRefreshing(false);
      }, 600);
    }
  };

  return (
    <Stack spacing={{ xs: 3, sm: 4 }} sx={{ width: "100%", pb: { xs: 3, sm: 6 } }}>
      {/* HEADER WITH TITLE AND REFRESH ACTION */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 0.5, alignItems: "center" }}
          >
            <Box
              sx={{
                width: { xs: 34, sm: 38 },
                height: { xs: 34, sm: 38 },
                borderRadius: 2.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 4px 12px rgba(37, 99, 235, 0.2)",
                flexShrink: 0,
              }}
            >
              <LayoutDashboard size={20} strokeWidth={2.2} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.25rem", sm: "1.65rem", md: "2rem" },
                wordBreak: "break-word",
              }}
            >
              System Reporting & Indicators
            </Typography>
          </Stack>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}
          >
            Real-time monitoring of system health, revenue growth and
            operational activities.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleRefreshAll}
          disabled={isRefreshing}
          startIcon={
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : ""}
              style={{ transition: "transform 0.5s ease" }}
            />
          }
          sx={{
            borderRadius: 2.5,
            px: 2.5,
            py: 1,
            textTransform: "none",
            borderColor: "divider",
            color: "text.primary",
            bgcolor: "background.paper",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0px 2px 8px rgba(0, 0, 0, 0.4)"
                : "0px 2px 8px rgba(0,0,0,0.02)",
            width: { xs: "100%", sm: "auto" },
            whiteSpace: "nowrap",
            flexShrink: 0,
            "&:hover": {
              borderColor: "text.primary",
              bgcolor: "action.hover",
            },
          }}
        >
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      </Box>

      {/* SECTION 1: KPI CARDS */}
      <KpiCards />

      {/* SECTION 2: GROWTH CHARTS */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Growth Charts
        </Typography>
        <GrowthCharts />
      </Box>

      {/* SECTION 3: SYSTEM ACTIVITY STATISTICS */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          System Activity Statistics
        </Typography>
        <ActivityStats />
      </Box>

      {/* SECTION 4: TOP RANKING DATA */}
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Performance Ranking
        </Typography>
        <TopRankings />
      </Box>
    </Stack>
  );
}
