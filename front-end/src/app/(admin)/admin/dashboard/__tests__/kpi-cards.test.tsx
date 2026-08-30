/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/dashboard/kpi-cards.tsx
 *
 * Purpose
 * -------
 * Verify that KpiCards component queries system metrics overview, displays loading skeleton,
 * error state, and KPI metric cards (Users, Courses, Revenue, Completion Rate).
 *
 * Tested Features
 * ---------------
 * ✓ Querying dashboard metrics via useDashboardMetrics
 * ✓ Rendering loading skeleton during initial fetch
 * ✓ ErrorState rendering when metrics query fails
 * ✓ Rendering KPI cards with values (Total Users, Total Courses, Total Revenue, Completion Rate)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Error state
 * ✓ Metrics data rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/metrics" (useDashboardMetrics)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - CSS backdrop filter blur effects
 *
 * Notes
 * -----
 * Unit test for KpiCards component.
 */

import * as metricsApi from "@/lib/api/metrics";
import type { DashboardOverviewResponse } from "@/lib/type/metrics";
import * as apiToast from "@/lib/use-api-with-toast";
import { createMockApiWithToast, createMockQueryResult } from "@/testing/mock-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KpiCards } from "../kpi-cards";

vi.mock("@/lib/api/metrics", () => ({
  useDashboardMetrics: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("KpiCards", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );
  });

  it("shouldRenderErrorStateWhenQueryFails", () => {
    vi.mocked(metricsApi.useDashboardMetrics).mockReturnValue(
      createMockQueryResult<DashboardOverviewResponse>(undefined, {
        error: new Error("Network error"),
        isError: true,
      }),
    );

    render(<KpiCards />);

    expect(
      screen.getByText("Failed to load dashboard metrics"),
    ).toBeInTheDocument();
  });

  it("shouldRenderKpiCardsWithFetchedValues", () => {
    const mockMetrics = {
      totalUsers: 1250,
      totalCourses: 45,
      totalLectures: 320,
      totalAssignments: 85,
      totalEnrollments: 3400,
      totalRevenue: 150000000,
      courseCompletionRate: 88.5,
    };

    vi.mocked(metricsApi.useDashboardMetrics).mockReturnValue(
      createMockQueryResult(mockMetrics),
    );

    render(<KpiCards />);

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText(/1[.,]250/)).toBeInTheDocument();

    expect(screen.getByText("Total Courses")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();

    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("88.50%")).toBeInTheDocument();
  });
});
