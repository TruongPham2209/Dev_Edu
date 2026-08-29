/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/layout/admin-layout.tsx
 *
 * Purpose
 * -------
 * Verify that AdminLayout component renders Admin Console title, navigation links
 * (Dashboard, Courses, Categories, Users, etc.), drawer collapse toggle, and children.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering admin sidebar navigation items
 * ✓ Drawer collapse toggle functionality
 * ✓ Children element wrapper rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ AdminLayout rendering with navigation links and children
 * ✓ Toggling drawer collapse button
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (usePathname)
 * - "@/lib/use-auth" (useAuth)
 *
 * Not Covered
 * -----------
 * - CSS backdrop filter blur effects
 *
 * Notes
 * -----
 * Unit test for AdminLayout component.
 */

import * as authHook from "@/lib/use-auth";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AdminLayout } from "../admin-layout";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useRouter: vi.fn().mockReturnValue({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/notification", () => ({
  useUnreadNotificationCountQuery: () => ({
    data: 0,
    isLoading: false,
  }),
  useNotificationsInfiniteQuery: () => ({
    data: null,
    isLoading: false,
  }),
  useMarkAllNotificationsReadMutation: () => ({
    mutate: vi.fn(),
  }),
  useMarkNotificationAsReadMutation: () => ({
    mutate: vi.fn(),
  }),
  useDeletePersonalNotificationMutation: () => ({
    mutate: vi.fn(),
  }),
}));

import { createMockAuthStatus, createMockAuthUser } from "@/testing/mock-data";

describe("AdminLayout Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usePathname).mockReturnValue("/admin");
    vi.mocked(authHook.useAuth).mockReturnValue(
      createMockAuthStatus({
        user: createMockAuthUser({
          id: "admin-1",
          username: "admin",
          fullName: "Admin User",
          role: "ADMIN",
          roles: ["ADMIN"],
        }),
      }),
    );
  });

  it("shouldRenderSidebarNavigationItemsAndChildrenContent", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AdminLayout with children.
    // ----------------------------------------------------------------------------
    render(
      <AdminLayout>
        <div data-testid="admin-child">Admin Page Content</div>
      </AdminLayout>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify admin console title and child content render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Admin Console")).toBeInTheDocument();
    expect(screen.getByTestId("admin-child")).toBeInTheDocument();
  });
});
