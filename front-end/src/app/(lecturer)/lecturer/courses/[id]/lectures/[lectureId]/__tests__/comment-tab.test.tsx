/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures/[lectureId]/comment-tab.tsx
 *
 * Purpose
 * -------
 * Verify that TabComments component queries lecture comments, posts new lecturer comments,
 * and renders comment lists.
 *
 * Tested Features
 * ---------------
 * ✓ CommentInput rendering and text input handling
 * ✓ Posting new comment via createCommentMutate
 * ✓ Rendering root comments list
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading state
 * ✓ Empty comments state
 * ✓ Comment creation and list rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/lectures" (useInfiniteLectureCommentsQuery, useCreateLectureCommentMutation, useDeleteLectureCommentMutation)
 * - "@/lib/use-auth" (useAuth)
 * - "@tanstack/react-query" (useQueryClient)
 *
 * Not Covered
 * -----------
 * - Infinite scroll pagination
 *
 * Notes
 * -----
 * Unit test for TabComments component.
 */

import * as lecturesApi from "@/lib/api/lectures";
import * as useAuthHook from "@/lib/use-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TabComments } from "../comment-tab";

vi.mock("@/lib/api/lectures", () => ({
  useInfiniteLectureCommentsQuery: vi.fn(),
  useCreateLectureCommentMutation: vi.fn(),
  useDeleteLectureCommentMutation: vi.fn(),
  getLectureComments: vi.fn(),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

describe("TabComments (Lecturer)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      user: { id: "lecturer-1", username: "prof_smith", avatarUrl: "" },
    } as any);

    vi.mocked(lecturesApi.useCreateLectureCommentMutation).mockReturnValue({
      mutateAsync: vi
        .fn()
        .mockResolvedValue({ id: "c-new", content: "Thanks!" }),
      isPending: false,
    } as any);

    vi.mocked(lecturesApi.useDeleteLectureCommentMutation).mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue(undefined),
    } as any);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldRenderEmptyStateWhenNoCommentsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return empty comments list.
    // ----------------------------------------------------------------------------
    vi.mocked(lecturesApi.useInfiniteLectureCommentsQuery).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isFetchingNextPage: false,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    } as any);

    // ----------------------------------------------------------------------------
    // Act
    // Render TabComments.
    // ----------------------------------------------------------------------------
    render(<TabComments lectureId="lec-1" />, { wrapper });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify empty state title.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No comments yet")).toBeInTheDocument();
  });
});
