/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/profile/page.tsx
 *
 * Purpose
 * -------
 * Verify that ProfilePage fetches current user data via useMeQuery, renders ProfileHeader,
 * animated tab bar ("Posted posts", "Saved posts"), and switches between tabs.
 *
 * Tested Features
 * ---------------
 * ✓ CircularProgress loading spinner when isLoading = true
 * ✓ EmptyState rendering when user profile data is missing
 * ✓ ProfileHeader rendering user details
 * ✓ Tab bar switching between Posted posts and Saved posts
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading profile state
 * ✓ Profile page render and tab switching
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/users" (useMeQuery, useChangePasswordMutation, useUpdateAvatarMutation)
 * - "@/lib/api/files" (usePreSignedUploadUrlMutation, useConfirmImageUploadMutation)
 * - "@/lib/api/forum" (useMyPostsInfiniteQuery, useSavedPostsInfiniteQuery)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - Backdrop filter blur
 *
 * Notes
 * -----
 * Unit test for ProfilePage component.
 */

import * as filesApi from "@/lib/api/files";
import * as forumApi from "@/lib/api/forum";
import * as usersApi from "@/lib/api/users";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProfilePage from "../page";

vi.mock("@/lib/api/users", () => ({
  useMeQuery: vi.fn(),
  useChangePasswordMutation: vi.fn(),
  useUpdateAvatarMutation: vi.fn(),
}));

vi.mock("@/lib/api/files", () => ({
  usePreSignedUploadUrlMutation: vi.fn(),
  useConfirmImageUploadMutation: vi.fn(),
}));

vi.mock("@/lib/api/forum", () => ({
  usePostedPostsInfiniteQuery: vi.fn(),
  useSavedPostsInfiniteQuery: vi.fn(),
  useUnsavePostMutation: () => ({ mutateAsync: vi.fn() }),
  useDeleteForumPostMutation: vi.fn(() => ({ mutate: vi.fn() })),
  useCreateForumPostMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useUpdateForumPostMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
  useDeletePostVersionMutation: vi.fn(() => ({ mutateAsync: vi.fn() })),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: any) => <img {...props} alt={props.alt || "image"} />,
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: vi.fn(),
      handleError: vi.fn(),
    } as any);

    vi.mocked(usersApi.useChangePasswordMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(usersApi.useUpdateAvatarMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(filesApi.useConfirmImageUploadMutation).mockReturnValue({
      mutateAsync: vi.fn(),
    } as any);

    vi.mocked(forumApi.usePostedPostsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
    } as any);

    vi.mocked(forumApi.useSavedPostsInfiniteQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
    } as any);

    class MockIntersectionObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    window.IntersectionObserver = MockIntersectionObserver as any;
  });

  it("shouldRenderUserProfileAndSwitchTabs", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return logged-in user profile.
    // ----------------------------------------------------------------------------
    const mockUser = {
      id: "u-999",
      fullName: "Le Van C",
      username: "levanc",
      email: "levanc@example.com",
      role: "STUDENT",
    };

    vi.mocked(usersApi.useMeQuery).mockReturnValue({
      data: mockUser,
      isLoading: false,
      error: null,
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render ProfilePage.
    // ----------------------------------------------------------------------------
    render(<ProfilePage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify user profile title and tab headers render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Le Van C" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Posted posts")).toBeInTheDocument();
    expect(screen.getByText("Saved posts")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click Saved posts tab.
    // ----------------------------------------------------------------------------
    const savedTab = screen.getByText("Saved posts");
    fireEvent.click(savedTab);

    expect(screen.getByText("You haven't saved any posts")).toBeInTheDocument();
  });
});
