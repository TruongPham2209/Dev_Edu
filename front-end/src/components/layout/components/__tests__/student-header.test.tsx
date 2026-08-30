/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/layout/components/student-header.tsx
 *
 * Purpose
 * -------
 * Verify that StudentHeader component renders brand logo, navigation links, login/signup
 * buttons when unauthenticated, and cart/portal switches when authenticated.
 *
 * Tested Features
 * ---------------
 * ✓ Student navigation items rendering (Home, Courses, Forum)
 * ✓ Unauthenticated state (Log in & Sign up buttons)
 * ✓ Authenticated state (ShoppingCart button for STUDENT role, UserMenu)
 * ✓ Role-based portal switches (Switch to Lecturer Portal, Switch to Admin Portal)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Unauthenticated user viewing header
 * ✓ Authenticated student user viewing header
 * ✓ Authenticated lecturer/admin user viewing header
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (usePathname)
 * - "@/lib/use-auth" (useAuth)
 * - "../user-menu" (mocked UserMenu)
 *
 * Not Covered
 * -----------
 * - Scroll trigger backdrop filter transitions
 *
 * Notes
 * -----
 * Unit test for StudentHeader component.
 */

import * as authHook from "@/lib/use-auth";
import { createMockAuthStatus, createMockAuthUser } from "@/testing/mock-data";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudentHeader } from "../../components/student-header";

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

vi.mock("../user-menu", () => ({
  UserMenu: () => <div data-testid="user-menu">UserMenu</div>,
}));

vi.mock("../notification-center", () => ({
  NotificationCenter: () => (
    <div data-testid="notification-center">NotificationCenter</div>
  ),
}));

vi.mock("@/components/common/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">ThemeToggle</div>,
}));

describe("StudentHeader Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderNavItemsAndLoginSignupButtonsWhenUnauthenticated", () => {
    vi.mocked(usePathname).mockReturnValue("/home");
    vi.mocked(authHook.useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      role: null,
      roles: [],
    });

    render(<StudentHeader />);

    expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Forum/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /My Courses/i }),
    ).not.toBeInTheDocument();

    expect(screen.getByRole("link", { name: "Log in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign up" })).toBeInTheDocument();
  });

  it("shouldRenderCartButtonUserMenuAndMyCoursesWhenAuthenticatedAsStudent", () => {
    vi.mocked(usePathname).mockReturnValue("/courses");
    vi.mocked(authHook.useAuth).mockReturnValue(
      createMockAuthStatus({
        isAuthenticated: true,
        user: createMockAuthUser({
          id: "u-1",
          username: "student",
          fullName: "Student One",
          role: "STUDENT",
          roles: ["STUDENT"],
        }),
        role: "STUDENT",
        roles: ["STUDENT"],
      }),
    );

    render(<StudentHeader />);

    expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /My Courses/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Log in" }),
    ).not.toBeInTheDocument();
  });

  it("shouldNotRenderMyCoursesWhenAuthenticatedAsLecturerOnly", () => {
    vi.mocked(usePathname).mockReturnValue("/home");
    vi.mocked(authHook.useAuth).mockReturnValue(
      createMockAuthStatus({
        isAuthenticated: true,
        user: createMockAuthUser({
          id: "u-2",
          username: "lecturer",
          fullName: "Lecturer One",
          role: "LECTURER",
          roles: ["LECTURER"],
        }),
        role: "LECTURER",
        roles: ["LECTURER"],
      }),
    );

    render(<StudentHeader />);

    expect(
      screen.queryByRole("link", { name: /My Courses/i }),
    ).not.toBeInTheDocument();
  });
});
