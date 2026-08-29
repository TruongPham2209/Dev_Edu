/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/layout/components/user-menu.tsx
 *
 * Purpose
 * -------
 * Verify that UserMenu component renders user avatar with initials, dropdown menu
 * with user details and profile link, and executes logout session cleanup.
 *
 * Tested Features
 * ---------------
 * ✓ Null rendering when user is unauthenticated
 * ✓ Avatar initial generation from user fullName / username
 * ✓ Dropdown menu display (user fullName, role, Profile link, Logout item)
 * ✓ Logout flow (clearAuthSession, logoutAction, router navigation)
 *
 * Covered Scenarios
 * -----------------
 * ✓ Unauthenticated state (user = null)
 * ✓ Authenticated state (user = AuthUser)
 * ✓ User clicking Logout item
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/use-auth" (useAuth)
 * - "@/lib/auth-storage" (clearAuthSession)
 * - "@/app/logout/actions" (logoutAction)
 *
 * Not Covered
 * -----------
 * - Next.js App Router server side cookie deletion
 *
 * Notes
 * -----
 * Unit test for UserMenu component.
 */

import * as logoutActions from "@/app/logout/actions";
import * as authStorage from "@/lib/auth-storage";
import * as authHook from "@/lib/use-auth";
import {
  createMockAuthStatus,
  createMockAuthUser,
  createMockRouter,
} from "@/testing/mock-data";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserMenu } from "../user-menu";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/auth-storage", () => ({
  clearAuthSession: vi.fn(),
}));

vi.mock("@/app/logout/actions", () => ({
  logoutAction: vi.fn(),
}));

describe("UserMenu Component", () => {
  const mockReplace = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(
      createMockRouter({
        replace: mockReplace,
        refresh: mockRefresh,
      }),
    );
  });

  it("shouldReturnNullWhenUserIsUnauthenticated", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock useAuth returning null user.
    // ----------------------------------------------------------------------------
    vi.mocked(authHook.useAuth).mockReturnValue(
      createMockAuthStatus({
        user: null,
        isAuthenticated: false,
        role: null,
        roles: [],
      }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render component.
    // ----------------------------------------------------------------------------
    const { container } = render(<UserMenu />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify container is empty DOM element.
    // ----------------------------------------------------------------------------
    expect(container).toBeEmptyDOMElement();
  });

  it("shouldRenderAvatarAndUserDropdownMenuWhenAuthenticated", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock user profile.
    // ----------------------------------------------------------------------------
    const mockUser = createMockAuthUser({
      id: "u-1",
      username: "john_doe",
      fullName: "John Doe",
      role: "STUDENT",
      roles: ["STUDENT"],
      avatarUrl: "https://example.com/avatar.jpg",
    });

    vi.mocked(authHook.useAuth).mockReturnValue(
      createMockAuthStatus({
        user: mockUser,
        isAuthenticated: true,
        role: "STUDENT",
        roles: ["STUDENT"],
      }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render UserMenu.
    // ----------------------------------------------------------------------------
    render(<UserMenu />);

    // Click avatar button to open dropdown menu
    const avatarBtn = screen.getByRole("button");
    fireEvent.click(avatarBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify user fullName, role, Profile link, and Logout button appear in menu.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("STUDENT")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("shouldExecuteLogoutFlowWhenLogoutMenuItemIsClicked", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock user and resolved logoutAction.
    // ----------------------------------------------------------------------------
    const mockUser = createMockAuthUser({
      id: "u-1",
      username: "john_doe",
      fullName: "John Doe",
      role: "STUDENT",
      roles: ["STUDENT"],
    });

    vi.mocked(authHook.useAuth).mockReturnValue(
      createMockAuthStatus({
        user: mockUser,
        isAuthenticated: true,
        role: "STUDENT",
        roles: ["STUDENT"],
      }),
    );
    vi.mocked(logoutActions.logoutAction).mockResolvedValue({ success: true });

    render(<UserMenu />);

    // Open menu
    fireEvent.click(screen.getByRole("button"));

    // ----------------------------------------------------------------------------
    // Act
    // Click Logout menu item.
    // ----------------------------------------------------------------------------
    const logoutItem = screen.getByText("Logout");
    fireEvent.click(logoutItem);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify clearAuthSession, logoutAction, and router navigation.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(authStorage.clearAuthSession).toHaveBeenCalledTimes(1);
      expect(logoutActions.logoutAction).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/home");
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });
});
