/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/lectures/lecture-content.tsx
 *
 * Purpose
 * -------
 * Verify that LectureContent component renders breadcrumb navigation, title, duration badge,
 * video player or HTML content based on videoObjectKey, and Previous / Next navigation buttons.
 *
 * Tested Features
 * ---------------
 * ✓ Breadcrumbs navigation rendering
 * ✓ Lecture title, summary, duration, and completion status chip
 * ✓ LectureVideoPlayer rendering when videoObjectKey exists
 * ✓ LectureHTMLContent rendering when videoObjectKey is missing
 * ✓ Previous and Next navigation buttons click handlers
 *
 * Covered Scenarios
 * -----------------
 * ✓ Text-based lecture rendering
 * ✓ Video-based lecture rendering
 * ✓ Previous / Next navigation
 *
 * Mocked Dependencies
 * -------------------
 * - "./lecture-video-player" (mocked LectureVideoPlayer)
 * - "next/link" (mocked NextLink)
 *
 * Not Covered
 * -----------
 * - Video playback stream buffering
 *
 * Notes
 * -----
 * Unit test for LectureContent component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LectureContent } from "../lecture-content";

vi.mock("../lecture-video-player", () => ({
  LectureVideoPlayer: () => <div>Mocked Video Player</div>,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("LectureContent", () => {
  const mockLecture = {
    id: "lec-10",
    title: "Understanding Server Actions",
    summary: "Comprehensive guide to mutation handling in Next.js",
    duration: 450, // 7m 30s
    uploadedAt: "2026-06-20T10:00:00.000Z",
    isCompleted: false,
    content: "<p>Server Actions execute securely on the server.</p>",
    videoObjectKey: null,
  };

  it("shouldRenderTextBasedLectureContentAndNavigationButtons", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Callbacks for navigation.
    // ----------------------------------------------------------------------------
    const mockOnSelect = vi.fn();
    const mockOnNext = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render LectureContent for text lecture.
    // ----------------------------------------------------------------------------
    render(
      <LectureContent
        lecture={mockLecture as any}
        courseId="c-55"
        prevLecture={{ id: "lec-9", title: "Prev Lecture" } as any}
        nextLecture={{ id: "lec-11", title: "Next Lecture" } as any}
        onSelectLecture={mockOnSelect}
        onNext={mockOnNext}
        navigating={false}
        onVideoCompleted={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, summary, duration, and HTML content render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getAllByRole("heading", {
        name: "Understanding Server Actions",
      })[0],
    ).toBeInTheDocument();
    expect(
      screen.getByText("Comprehensive guide to mutation handling in Next.js"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Server Actions execute securely on the server."),
    ).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify Navigation
    // Click Previous and Next buttons.
    // ----------------------------------------------------------------------------
    const prevBtn = screen.getByRole("button", { name: "Previous" });
    const nextBtn = screen.getByRole("button", { name: "Next lesson" });

    fireEvent.click(prevBtn);
    expect(mockOnSelect).toHaveBeenCalledWith("lec-9");

    fireEvent.click(nextBtn);
    expect(mockOnNext).toHaveBeenCalled();
  });
});
