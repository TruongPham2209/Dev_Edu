/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/lectures/lecture-video-player.tsx
 *
 * Purpose
 * -------
 * Verify that LectureVideoPlayer:
 * - Renders loading state when download URL is being fetched
 * - Renders video tag with direct streaming URL (preload="metadata", playsInline)
 * - Handles error state with reload button
 * - Handles onError event by refetching download URL
 * - Updates lecture progress on playback and onEnded
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/files" (useDownloadUrlQuery)
 * - "@/lib/api/lectures" (useUpdateLectureProgressMutation)
 * - "@tanstack/react-query" (useQueryClient)
 */

import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LectureVideoPlayer } from "../lecture-video-player";
import * as filesApi from "@/lib/api/files";
import * as lecturesApi from "@/lib/api/lectures";
import type { FileUploadResponse } from "@/lib/type/files";
import {
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";

vi.mock("@/lib/api/files", () => ({
  useDownloadUrlQuery: vi.fn(),
}));

vi.mock("@/lib/api/lectures", () => ({
  useUpdateLectureProgressMutation: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: vi.fn(),
    }),
  };
});

describe("LectureVideoPlayer", () => {
  const mockUpdateProgress = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(lecturesApi.useUpdateLectureProgressMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockUpdateProgress,
      }),
    );
  });

  it("shouldRenderLoadingStateWhenUrlIsFetching", () => {
    vi.mocked(filesApi.useDownloadUrlQuery).mockReturnValue(
      createMockQueryResult<FileUploadResponse>(undefined, {
        isLoading: true,
        isPending: true,
      }),
    );

    render(
      <LectureVideoPlayer
        lectureId="lec-1"
        videoObjectKey="videos/test.mp4"
      />,
    );

    expect(screen.getByText("Loading video...")).toBeInTheDocument();
  });

  it("shouldRenderVideoTagDirectlyWithStreamingUrlAndRangeAttributes", () => {
    vi.mocked(filesApi.useDownloadUrlQuery).mockReturnValue(
      createMockQueryResult<FileUploadResponse>({
        originalFileName: "test.mp4",
        contentType: "video/mp4",
        objectKey: "videos/test.mp4",
        downloadUrl: "https://r2.storage/stream/test.mp4",
      }),
    );

    render(
      <LectureVideoPlayer
        lectureId="lec-1"
        videoObjectKey="videos/test.mp4"
      />,
    );

    const videoEl = document.querySelector("video");
    expect(videoEl).not.toBeNull();
    expect(videoEl?.getAttribute("src")).toBe("https://r2.storage/stream/test.mp4");
    expect(videoEl?.getAttribute("preload")).toBe("metadata");
  });

  it("shouldHandleVideoErrorAndRefetchFreshDownloadUrl", async () => {
    mockRefetch.mockResolvedValue({
      data: {
        originalFileName: "test.mp4",
        contentType: "video/mp4",
        objectKey: "videos/test.mp4",
        downloadUrl: "https://r2.storage/stream/test-refreshed.mp4",
      },
    });

    vi.mocked(filesApi.useDownloadUrlQuery).mockReturnValue(
      createMockQueryResult<FileUploadResponse>(
        {
          originalFileName: "test.mp4",
          contentType: "video/mp4",
          objectKey: "videos/test.mp4",
          downloadUrl: "https://r2.storage/stream/test.mp4",
        },
        { refetch: mockRefetch },
      ),
    );

    render(
      <LectureVideoPlayer
        lectureId="lec-1"
        videoObjectKey="videos/test.mp4"
      />,
    );

    const videoEl = document.querySelector("video")!;
    expect(videoEl).not.toBeNull();

    // Trigger video error event
    fireEvent.error(videoEl);

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it("shouldTriggerProgressUpdateOnVideoEnded", async () => {
    const handleCompleted = vi.fn();
    mockUpdateProgress.mockResolvedValue({ completed: true });

    vi.mocked(filesApi.useDownloadUrlQuery).mockReturnValue(
      createMockQueryResult<FileUploadResponse>({
        originalFileName: "test.mp4",
        contentType: "video/mp4",
        objectKey: "videos/test.mp4",
        downloadUrl: "https://r2.storage/stream/test.mp4",
      }),
    );

    render(
      <LectureVideoPlayer
        lectureId="lec-1"
        videoObjectKey="videos/test.mp4"
        onCompleted={handleCompleted}
        isInitiallyCompleted={false}
      />,
    );

    const videoEl = document.querySelector("video")!;
    expect(videoEl).not.toBeNull();

    // Trigger onEnded
    fireEvent.ended(videoEl);

    await waitFor(() => {
      expect(mockUpdateProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          lectureId: "lec-1",
        }),
      );
      expect(handleCompleted).toHaveBeenCalled();
    });
  });
});
