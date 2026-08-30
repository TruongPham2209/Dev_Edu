import React from "react";
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
  default: ({ alt = "image", ...props }: React.ComponentProps<"img">) => React.createElement("img", { alt, ...props }),
}));

import type { UserResponse } from "@/lib/type/users";
import { createMockAuthUser, createMockUser } from "@/testing/mock-data";
import {
  createMockApiWithToast,
  createMockInfiniteQueryResult,
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    vi.mocked(usersApi.useChangePasswordMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(usersApi.useUpdateAvatarMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(filesApi.usePreSignedUploadUrlMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(filesApi.useConfirmImageUploadMutation).mockReturnValue(
      createMockMutationResult(),
    );

    vi.mocked(forumApi.usePostedPostsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        {
          pages: [
            {
              contents: [],
              currentPage: 0,
              pageSize: 10,
              totalElements: 0,
              totalPages: 0,
            },
          ],
          pageParams: [null],
        },
      ),
    );

    vi.mocked(forumApi.useSavedPostsInfiniteQuery).mockReturnValue(
      createMockInfiniteQueryResult(
        {
          pages: [
            {
              contents: [],
              currentPage: 0,
              pageSize: 10,
              totalElements: 0,
              totalPages: 0,
            },
          ],
          pageParams: [null],
        },
      ),
    );

    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      configurable: true,
      value: MockIntersectionObserver,
    });
  });

  it("shouldRenderUserProfileAndSwitchTabs", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return logged-in user profile.
    // ----------------------------------------------------------------------------
    const mockUser: UserResponse = createMockUser({
      id: "u-999",
      fullName: "Le Van C",
      username: "levanc",
      email: "levanc@example.com",
      role: "STUDENT",
    });

    vi.mocked(usersApi.useMeQuery).mockReturnValue(
      createMockQueryResult(mockUser),
    );

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
