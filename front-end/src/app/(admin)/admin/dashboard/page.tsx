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
    <Stack spacing={4} sx={{ width: "100%", pb: 6 }}>
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
        <Box>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ mb: 0.5, alignItems: "center" }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.5,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 4px 12px rgba(37, 99, 235, 0.2)",
              }}
            >
              <LayoutDashboard size={20} strokeWidth={2.2} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              System Reporting & Indicators
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
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
            fontWeight: 700,
            borderColor: "rgba(15, 23, 42, 0.12)",
            color: "text.primary",
            bgcolor: "background.paper",
            boxShadow: "0px 2px 8px rgba(0,0,0,0.02)",
            "&:hover": {
              borderColor: "rgba(15, 23, 42, 0.2)",
              bgcolor: "rgba(15, 23, 42, 0.02)",
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
