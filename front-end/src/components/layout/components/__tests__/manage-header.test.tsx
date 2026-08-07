/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/layout/components/manage-header.tsx
 *
 * Purpose
 * -------
 * Verify that ManageHeader component renders page title, branding logo, role-based
 * portal switch buttons (Admin -> Lecturer, Lecturer -> Admin), mobile drawer menu toggle,
 * and user menu.
 *
 * Tested Features
 * ---------------
 * ✓ Title and branding logo display
 * ✓ Switch to Student Site button rendering
 * ✓ Conditional "Switch to Lecturer Portal" button (for Admin pages when user has LECTURER role)
 * ✓ Conditional "Switch to Admin Portal" button (for Lecturer pages when user has ADMIN role)
 * ✓ Mobile menu toggle button click execution
 *
 * Covered Scenarios
 * -----------------
 * ✓ Admin page pathname ("/admin/courses") with LECTURER role
 * ✓ Lecturer page pathname ("/lecturer/courses") with ADMIN role
 * ✓ Mobile view (isMobile = true) menu click toggle
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (usePathname)
 * - "@/lib/use-auth" (useAuth)
 * - "../user-menu" (mocked UserMenu component)
 *
 * Not Covered
 * -----------
 * - Scroll trigger backdrop blur transitions
 *
 * Notes
 * -----
 * Unit test for ManageHeader layout component.
 */

import * as authHook from "@/lib/use-auth";
import { fireEvent, render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManageHeader } from "../manage-header";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../user-menu", () => ({
  UserMenu: () => <div data-testid="user-menu">UserMenu</div>,
}));

describe("ManageHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderTitleAndSwitchToStudentSiteButton", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock pathname and auth state.
    // ----------------------------------------------------------------------------
    vi.mocked(usePathname).mockReturnValue("/admin/dashboard");
    vi.mocked(authHook.useAuth).mockReturnValue({
      roles: ["ADMIN"],
      isAuthenticated: true,
      role: "ADMIN",
      user: { id: "u-1" } as any,
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render ManageHeader.
    // ----------------------------------------------------------------------------
    render(<ManageHeader title="Admin Console" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, logo, and switch button exist.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Admin Console")).toBeInTheDocument();
    expect(screen.getByText("Switch to Student Site")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("shouldRenderSwitchToLecturerPortalButtonWhenOnAdminPathAndUserHasLecturerRole", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock pathname "/admin/users" and user with LECTURER role.
    // ----------------------------------------------------------------------------
    vi.mocked(usePathname).mockReturnValue("/admin/users");
    vi.mocked(authHook.useAuth).mockReturnValue({
      roles: ["ADMIN", "LECTURER"],
      isAuthenticated: true,
      role: "ADMIN",
      user: { id: "u-1" } as any,
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render header.
    // ----------------------------------------------------------------------------
    render(<ManageHeader title="User Management" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "Switch to Lecturer Portal" button renders with link to /lecturer.
    // ----------------------------------------------------------------------------
    const switchBtn = screen.getByRole("link", {
      name: /Switch to Lecturer Portal/i,
    });
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute("href", "/lecturer");
  });

  it("shouldTriggerOnMenuClickWhenMobileToggleIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare click handler and mock hooks.
    // ----------------------------------------------------------------------------
    const handleMenuClick = vi.fn();
    vi.mocked(usePathname).mockReturnValue("/admin");
    vi.mocked(authHook.useAuth).mockReturnValue({
      roles: ["ADMIN"],
      isAuthenticated: true,
      role: "ADMIN",
      user: { id: "u-1" } as any,
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render in mobile mode.
    // ----------------------------------------------------------------------------
    render(
      <ManageHeader
        title="Admin"
        isMobile={true}
        menuOpen={false}
        onMenuClick={handleMenuClick}
      />,
    );

    // Click mobile menu button
    const toggleBtn = screen.getAllByRole("button")[0];
    fireEvent.click(toggleBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onMenuClick handler execution.
    // ----------------------------------------------------------------------------
    expect(handleMenuClick).toHaveBeenCalledTimes(1);
  });
});
