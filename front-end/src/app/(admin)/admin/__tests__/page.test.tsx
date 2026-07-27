/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminDashboardPage component renders the AdminDashboard component inside Stack.
 *
 * Tested Features
 * ---------------
 * ✓ AdminDashboard rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering admin dashboard main entry route
 *
 * Mocked Dependencies
 * -------------------
 * - "@/app/(admin)/admin/dashboard/page" (mocked AdminDashboard)
 *
 * Not Covered
 * -----------
 * - Internal dashboard charts
 *
 * Notes
 * -----
 * Unit test for AdminDashboardPage index page.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminDashboardPage from "../page";

vi.mock("@/app/(admin)/admin/dashboard/page", () => ({
  default: () => <div data-testid="admin-dashboard">Admin Dashboard View</div>,
}));

describe("AdminDashboardPage", () => {
  it("shouldRenderAdminDashboardView", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AdminDashboardPage.
    // ----------------------------------------------------------------------------
    render(<AdminDashboardPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify AdminDashboard view renders.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("admin-dashboard")).toBeInTheDocument();
  });
});
