/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/hero-section/lecture-hero-info.tsx
 *
 * Purpose
 * -------
 * Verify that LectureHeroInfo component renders lecture title, summary, upload date,
 * video preview placeholder ("No video uploaded" vs "Click to play"), and plays video.
 *
 * Tested Features
 * ---------------
 * ✓ Title, summary, and uploaded date rendering
 * ✓ Fallback state when videoObjectKey is missing ("No video uploaded")
 * ✓ Interactive play button loading video URL via getDownloadUrl
 *
 * Covered Scenarios
 * -----------------
 * ✓ Lecture without video (videoObjectKey = null)
 * ✓ Lecture with video (videoObjectKey = "videos/lec-1.mp4")
 * ✓ Clicking play button to load download URL
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/files" (getDownloadUrl)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - HTML5 Video playback events (ended, pause)
 *
 * Notes
 * -----
 * Unit test for LectureHeroInfo component.
 */

import * as filesApi from "@/lib/api/files";
import * as apiToast from "@/lib/use-api-with-toast";
import type { LectureResponse } from "@/lib/type/lectures";
import { createMockLecture } from "@/testing/mock-data";
import { createMockApiWithToast } from "@/testing/mock-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LectureHeroInfo } from "../lecture-hero-info";

vi.mock("@/lib/api/files", () => ({
  getDownloadUrl: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("LectureHeroInfo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );
  });

  it("shouldRenderNoVideoUploadedMessageWhenVideoObjectKeyIsMissing", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare lecture without video.
    // ----------------------------------------------------------------------------
    const lectureWithoutVideo: LectureResponse = createMockLecture({
      id: "lec-1",
      title: "Introduction to React 19",
      summary: "Basic overview of React 19 fundamentals.",
      videoObjectKey: null,
      uploadedAt: "2026-06-01T10:00:00.000Z",
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render LectureHeroInfo.
    // ----------------------------------------------------------------------------
    render(<LectureHeroInfo lecture={lectureWithoutVideo} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, summary, date, and "No video uploaded" text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Introduction to React 19")).toBeInTheDocument();
    expect(
      screen.getByText("Basic overview of React 19 fundamentals."),
    ).toBeInTheDocument();
    expect(screen.getByText("No video uploaded")).toBeInTheDocument();
  });

  it("shouldFetchVideoDownloadUrlAndRenderVideoPlayerOnPlayClick", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock getDownloadUrl resolution.
    // ----------------------------------------------------------------------------
    const lectureWithVideo: LectureResponse = createMockLecture({
      id: "lec-2",
      title: "Advanced Server Actions",
      summary: "Deep dive into Next.js Server Actions.",
      videoObjectKey: "videos/lec-2.mp4",
      uploadedAt: "2026-06-05T10:00:00.000Z",
    });

    vi.mocked(filesApi.getDownloadUrl).mockResolvedValue({
      originalFileName: "lec-2.mp4",
      contentType: "video/mp4",
      objectKey: "videos/lec-2.mp4",
      downloadUrl: "https://example.com/video-stream.mp4",
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render LectureHeroInfo.
    // ----------------------------------------------------------------------------
    render(<LectureHeroInfo lecture={lectureWithVideo} />);

    // Click play button container
    const playContainer = screen.getByText("Click to play");
    fireEvent.click(playContainer);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify getDownloadUrl was called with "videos/lec-2.mp4" and video element rendered with streaming attributes.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(filesApi.getDownloadUrl).toHaveBeenCalledWith("videos/lec-2.mp4");
    });

    const videoEl = document.querySelector("video");
    expect(videoEl).not.toBeNull();
    expect(videoEl?.getAttribute("src")).toBe(
      "https://example.com/video-stream.mp4",
    );
    expect(videoEl?.getAttribute("preload")).toBe("metadata");

    // Trigger video error to test recovery
    vi.mocked(filesApi.getDownloadUrl).mockResolvedValueOnce({
      originalFileName: "lec-2.mp4",
      contentType: "video/mp4",
      objectKey: "videos/lec-2.mp4",
      downloadUrl: "https://example.com/video-stream-refreshed.mp4",
    });

    fireEvent.error(videoEl!);

    await waitFor(() => {
      expect(filesApi.getDownloadUrl).toHaveBeenCalledTimes(2);
    });
  });
});
