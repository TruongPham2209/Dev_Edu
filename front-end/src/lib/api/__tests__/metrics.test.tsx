/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/metrics.ts
 *
 * Purpose
 * -------
 * Verify that metrics API helper functions and React Query hooks send requests to analytics endpoints.
 *
 * Tested Features
 * ---------------
 * ✓ useDashboardMetrics query hook (/api/metrics/dashboard)
 * ✓ useUserGrowth query hook (/api/metrics/users-growth)
 * ✓ useActivity query hook (/api/metrics/activity)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Fetching dashboard overview metrics
 * ✓ Fetching growth and activity stats
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/client" (apiGet)
 *
 * Not Covered
 * -----------
 * - Real backend analytics calculations
 *
 * Notes
 * -----
 * Unit test for metrics API endpoints.
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useDashboardMetrics,
  useUserGrowth,
  useActivity,
} from "../metrics";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
}));

describe("Metrics API", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldExecuteUseDashboardMetricsHook", async () => {
    const mockOverview = { totalUsers: 500, totalRevenue: 10000000 };
    vi.mocked(client.apiGet).mockResolvedValue(mockOverview);

    const { result } = renderHook(() => useDashboardMetrics(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.apiGet).toHaveBeenCalledWith("/api/metrics/dashboard");
    expect(result.current.data).toEqual(mockOverview);
  });

  it("shouldExecuteUseUserGrowthHookWithPeriod", async () => {
    const mockGrowth = [{ period: "MONTHLY", count: 120 }];
    vi.mocked(client.apiGet).mockResolvedValue(mockGrowth);

    const { result } = renderHook(
      () => useUserGrowth("MONTHLY"),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.apiGet).toHaveBeenCalledWith(
      "/api/metrics/users-growth?period=MONTHLY",
    );
    expect(result.current.data).toEqual(mockGrowth);
  });

  it("shouldExecuteUseActivityHookWithDays", async () => {
    const mockActivity = { dailyActiveUsers: 85 };
    vi.mocked(client.apiGet).mockResolvedValue(mockActivity);

    const { result } = renderHook(() => useActivity(30), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(client.apiGet).toHaveBeenCalledWith("/api/metrics/activity?days=30");
    expect(result.current.data).toEqual(mockActivity);
  });
});
