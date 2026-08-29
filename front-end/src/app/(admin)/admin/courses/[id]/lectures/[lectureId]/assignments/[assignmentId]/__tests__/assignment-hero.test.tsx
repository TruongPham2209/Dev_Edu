/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/[id]/lectures/[lectureId]/assignments/[assignmentId]/assignment-hero.tsx
 *
 * Purpose
 * -------
 * Verify that AssignmentHeroSection component renders breadcrumbs, AssignmentHeroInfo, and HTML instructions content.
 *
 * Tested Features
 * ---------------
 * ✓ Breadcrumbs navigation rendering
 * ✓ AssignmentHeroInfo rendering
 * ✓ Instructions box with HTML description rendering
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering admin assignment hero header
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/common/hero-section/assignment-hero-info" (mocked AssignmentHeroInfo)
 *
 * Not Covered
 * -----------
 * - CSS prose typography styling
 *
 * Notes
 * -----
 * Unit test for AssignmentHeroSection component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AssignmentResponse } from "@/lib/type/assignments";
import { createMockAssignment } from "@/testing/mock-data";
import { AssignmentHeroSection } from "../assignment-hero";

vi.mock("@/components/common/hero-section/assignment-hero-info", () => ({
  AssignmentHeroInfo: ({
    assignment,
  }: {
    assignment?: { title?: string };
  }) => (
    <div data-testid="assignment-hero-info-mock">{assignment?.title}</div>
  ),
}));

describe("AssignmentHeroSection", () => {
  it("shouldRenderBreadcrumbsAssignmentInfoAndInstructions", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock assignment object.
    // ----------------------------------------------------------------------------
    const mockAssignment: AssignmentResponse = createMockAssignment({
      id: "asgn-500",
      title: "Build RESTful APIs with Spring Boot",
      description: "<p>Implement GET, POST, PUT, DELETE endpoints.</p>",
    });

    // ----------------------------------------------------------------------------
    // Act
    // Render AssignmentHeroSection.
    // ----------------------------------------------------------------------------
    render(
      <AssignmentHeroSection
        assignment={mockAssignment}
        courseId="course-1"
        courseTitle="Java Backend Engineering"
        lectureId="lec-10"
        lectureTitle="REST API Principles"
        submissionsTotal={8}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify breadcrumbs, hero info, and instructions render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Java Backend Engineering")).toBeInTheDocument();
    expect(screen.getByText("REST API Principles")).toBeInTheDocument();
    expect(screen.getByTestId("assignment-hero-info-mock")).toHaveTextContent(
      "Build RESTful APIs with Spring Boot",
    );
    expect(screen.getByText("Instructions")).toBeInTheDocument();
    expect(
      screen.getByText("Implement GET, POST, PUT, DELETE endpoints."),
    ).toBeInTheDocument();
  });
});
