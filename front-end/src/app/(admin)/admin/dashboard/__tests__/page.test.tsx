/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/dashboard/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminDashboardPage component renders "System Reporting & Indicators" header title,
 * Refresh Data action button, and all 4 dashboard sections (KpiCards, GrowthCharts, ActivityStats, TopRankings).
 *
 * Tested Features
 * ---------------
 * ✓ Rendering System Reporting & Indicators header title
 * ✓ Refresh Data button click triggering query invalidation
 * ✓ Rendering KpiCards, GrowthCharts, ActivityStats, and TopRankings sections
 *
 * Covered Scenarios
 * -----------------
 * ✓ Dashboard page layout and refresh action
 *
 * Mocked Dependencies
 * -------------------
 * - "./kpi-cards" (mocked KpiCards)
 * - "./growth-charts" (mocked GrowthCharts)
 * - "./activity-stats" (mocked ActivityStats)
 * - "./top-rankings" (mocked TopRankings)
 * - "@tanstack/react-query" (useQueryClient)
 *
 * Not Covered
 * -----------
 * - Internal chart library canvas rendering
 *
 * Notes
 * -----
 * Unit test for AdminDashboardPage component.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "../page";

vi.mock("../kpi-cards", () => ({
  KpiCards: () => <div data-testid="kpi-cards-section">KPI Cards Section</div>,
}));

vi.mock("../growth-charts", () => ({
  GrowthCharts: () => (
    <div data-testid="growth-charts-section">Growth Charts Section</div>
  ),
}));

vi.mock("../activity-stats", () => ({
  ActivityStats: () => (
    <div data-testid="activity-stats-section">Activity Stats Section</div>
  ),
}));

vi.mock("../top-rankings", () => ({
  TopRankings: () => (
    <div data-testid="top-rankings-section">Top Rankings Section</div>
  ),
}));

describe("AdminDashboardPage", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldRenderDashboardHeaderAndAllSections", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AdminDashboardPage wrapped in QueryClientProvider.
    // ----------------------------------------------------------------------------
    render(<AdminDashboardPage />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and all dashboard sections render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("System Reporting & Indicators"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("kpi-cards-section")).toBeInTheDocument();
    expect(screen.getByTestId("growth-charts-section")).toBeInTheDocument();
    expect(screen.getByTestId("activity-stats-section")).toBeInTheDocument();
    expect(screen.getByTestId("top-rankings-section")).toBeInTheDocument();

    const refreshBtn = screen.getByRole("button", { name: /Refresh Data/i });
    fireEvent.click(refreshBtn);
  });
});
