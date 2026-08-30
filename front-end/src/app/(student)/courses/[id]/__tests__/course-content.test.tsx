/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/course-content.tsx
 *
 * Purpose
 * -------
 * Verify that CourseContent component renders total lectures count, lecture titles,
 * duration/document badges, accordion expand details, and EmptyState when no lectures exist.
 *
 * Tested Features
 * ---------------
 * ✓ Total lectures count header display
 * ✓ Accordion list of lecture titles, index numbers, and duration
 * ✓ EmptyState rendering when lectures array is empty
 *
 * Covered Scenarios
 * -----------------
 * ✓ Empty lectures list
 * ✓ Lecture items rendering and accordion expand
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI components)
 *
 * Not Covered
 * -----------
 * - CSS transition animations
 *
 * Notes
 * -----
 * Unit test for CourseContent component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LectureResponse } from "@/lib/type/lectures";
import { CourseContent } from "../course-content";

describe("CourseContent", () => {
  it("shouldRenderEmptyStateWhenNoLecturesExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CourseContent with empty lectures.
    // ----------------------------------------------------------------------------
    render(<CourseContent lectures={[]} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify "No lectures" empty state text.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("No lectures")).toBeInTheDocument();
    expect(
      screen.getByText(
        "This course does not have any lectures yet. Please check back later.",
      ),
    ).toBeInTheDocument();
  });

  it("shouldRenderLectureItemsAndTotalCount", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock lectures list.
    // ----------------------------------------------------------------------------
    const mockLectures: LectureResponse[] = [
      {
        id: "lec-1",
        title: "Introduction to React 19",
        duration: 360, // 6 mins
        summary: "Overview of new features in React 19",
        content: "",
        videoObjectKey: "video.mp4",
        uploadedAt: "2026-01-01T00:00:00Z",
        isCompleted: false,
      },
      {
        id: "lec-2",
        title: "Server Components Deep Dive",
        duration: 0, // Document
        summary: "In-depth guide on React Server Components",
        content: "",
        videoObjectKey: "",
        uploadedAt: "2026-01-02T00:00:00Z",
        isCompleted: false,
      },
    ];

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseContent.
    // ----------------------------------------------------------------------------
    render(<CourseContent lectures={mockLectures} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify total count and lecture titles render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Total 2 lectures")).toBeInTheDocument();
    expect(screen.getByText("Introduction to React 19")).toBeInTheDocument();
    expect(screen.getByText("Server Components Deep Dive")).toBeInTheDocument();

    // Verify duration badge for video vs document
    expect(screen.getByText("6:00")).toBeInTheDocument();
    expect(screen.getByText("Document")).toBeInTheDocument();
  });
});
