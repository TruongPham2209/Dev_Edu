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
 * Verify that ManageHeader component renders title, role switch buttons (e.g. Switch to Student Site,
 * Switch to Lecturer Portal), and mobile menu toggle button.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering management title and logo link
 * ✓ "Switch to Student Site" button
 * ✓ "Switch to Lecturer Portal" button for users with LECTURER role
 * ✓ Mobile menu toggle button click handling
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering admin manage header
 * ✓ Rendering lecturer role switch button
 * ✓ Mobile toggle trigger
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (usePathname)
 * - "@/lib/use-auth" (useAuth)
 * - "../user-menu" (mocked UserMenu)
 * - "../notification-center" (mocked NotificationCenter)
 *
 * Not Covered
 * -----------
 * - Scroll trigger backdrop blur
 *
 * Notes
 * -----
 * Unit test for ManageHeader component.
 */

import * as authHook from "@/lib/use-auth";
import { createMockAuthStatus, createMockAuthUser } from "@/testing/mock-data";
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

vi.mock("../notification-center", () => ({
  NotificationCenter: () => (
    <div data-testid="notification-center">NotificationCenter</div>
  ),
}));

describe("ManageHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderTitleAndSwitchToStudentSiteButton", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/dashboard");
    vi.mocked(authHook.useAuth).mockReturnValue(
      createMockAuthStatus({
        roles: ["ADMIN"],
        role: "ADMIN",
        user: createMockAuthUser({ id: "u-1", role: "ADMIN", roles: ["ADMIN"] }),
      }),
    );

    render(<ManageHeader title="Admin Console" />);

    expect(screen.getByText("Admin Console")).toBeInTheDocument();
    expect(screen.getByText("Switch to Student Site")).toBeInTheDocument();
    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
  });

  it("shouldRenderSwitchToLecturerPortalButtonWhenOnAdminPathAndUserHasLecturerRole", () => {
    vi.mocked(usePathname).mockReturnValue("/admin/users");
    vi.mocked(authHook.useAuth).mockReturnValue(
      createMockAuthStatus({
        roles: ["ADMIN", "LECTURER"],
        role: "ADMIN",
        user: createMockAuthUser({
          id: "u-1",
          role: "ADMIN",
          roles: ["ADMIN", "LECTURER"],
        }),
      }),
    );

    render(<ManageHeader title="User Management" />);

    const switchBtn = screen.getByRole("link", {
      name: /Switch to Lecturer Portal/i,
    });
    expect(switchBtn).toBeInTheDocument();
    expect(switchBtn).toHaveAttribute("href", "/lecturer");
  });

  it("shouldTriggerOnMenuClickWhenMobileToggleIsClicked", () => {
    const handleMenuClick = vi.fn();
    vi.mocked(usePathname).mockReturnValue("/admin");
    vi.mocked(authHook.useAuth).mockReturnValue(
      createMockAuthStatus({
        roles: ["ADMIN"],
        role: "ADMIN",
        user: createMockAuthUser({ id: "u-1", role: "ADMIN", roles: ["ADMIN"] }),
      }),
    );

    render(
      <ManageHeader
        title="Admin"
        isMobile={true}
        menuOpen={false}
        onMenuClick={handleMenuClick}
      />,
    );

    const toggleBtn = screen.getAllByRole("button")[0];
    fireEvent.click(toggleBtn);

    expect(handleMenuClick).toHaveBeenCalledTimes(1);
  });
});
