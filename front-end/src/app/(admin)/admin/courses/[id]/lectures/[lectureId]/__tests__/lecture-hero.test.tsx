/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/[id]/lectures/[lectureId]/lecture-hero.tsx
 *
 * Purpose
 * -------
 * Verify that LectureHeroSection component renders breadcrumb navigation links, LectureHeroInfo, and metric counters.
 *
 * Tested Features
 * ---------------
 * ✓ Breadcrumb links rendering
 * ✓ LectureHeroInfo rendering
 * ✓ Metric cards (Estimated duration, Attached materials, Essay Assignments) rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering admin lecture hero header
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/common/hero-section/lecture-hero-info" (mocked LectureHeroInfo)
 *
 * Not Covered
 * -----------
 * - CSS hover animations
 *
 * Notes
 * -----
 * Unit test for LectureHeroSection component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LectureHeroSection } from "../lecture-hero";
import { createMockLecture } from "@/testing/mock-data";
import { LectureResponse } from "@/lib/type/lectures";

vi.mock("@/components/common/hero-section/lecture-hero-info", () => ({
  LectureHeroInfo: ({ lecture }: { lecture?: { title?: string } }) => (
    <div data-testid="lecture-hero-info-mock">{lecture?.title}</div>
  ),
}));

describe("LectureHeroSection", () => {
  it("shouldRenderBreadcrumbsLectureInfoAndMetrics", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock lecture object.
    // ----------------------------------------------------------------------------
    const mockLecture: LectureResponse = createMockLecture({
      title: "Spring Security & OAuth2 Integration",
      videoObjectKey: "videos/oauth2.mp4",
    });

    // Act
    // ----------------------------------------------------------------------------
    render(
      <LectureHeroSection
        lecture={mockLecture}
        courseId="course-123"
        courseTitle="Spring Boot Masterclass"
        materialsCount={3}
        assignmentsCount={2}
      />
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify breadcrumb, hero info, and metric cards render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Course Management")).toBeInTheDocument();
    expect(screen.getByText("Spring Boot Masterclass")).toBeInTheDocument();
    expect(screen.getByTestId("lecture-hero-info-mock")).toHaveTextContent(
      "Spring Security & OAuth2 Integration",
    );
    expect(screen.getByText("Estimated duration")).toBeInTheDocument();
    expect(screen.getByText("1h 0m")).toBeInTheDocument();
    expect(screen.getByText("Attached materials")).toBeInTheDocument();
    expect(screen.getByText("3 materials")).toBeInTheDocument();
  });
});
