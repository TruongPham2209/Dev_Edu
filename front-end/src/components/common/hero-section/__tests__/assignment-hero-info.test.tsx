/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/common/hero-section/assignment-hero-info.tsx
 *
 * Purpose
 * -------
 * Verify that AssignmentHeroInfo component renders assignment title, lecture title,
 * creation date, and total submissions count.
 *
 * Tested Features
 * ---------------
 * ✓ Title and lecture title display
 * ✓ Formatted creation date display
 * ✓ Total submissions count display
 *
 * Covered Scenarios
 * -----------------
 * ✓ AssignmentHeroInfo rendering with assignment details and submission total
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS backdrop blur effects
 *
 * Notes
 * -----
 * Unit test for AssignmentHeroInfo component.
 */

import type { AssignmentResponse } from "@/lib/type/assignments";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssignmentHeroInfo } from "../assignment-hero-info";

describe("AssignmentHeroInfo", () => {
  const mockAssignment: AssignmentResponse = {
    id: "assign-1",
    title: "Build REST API with Spring Security",
    createdAt: "2026-05-20T10:00:00.000Z",
  } as any;

  it("shouldRenderAssignmentTitleLectureTitleAndSubmissionsTotal", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AssignmentHeroInfo component.
    // ----------------------------------------------------------------------------
    render(
      <AssignmentHeroInfo
        assignment={mockAssignment}
        lectureTitle="Lecture 5: Security Architecture"
        submissionsTotal={42}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, lecture title, date, and submission total.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Build REST API with Spring Security"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Lecture 5: Security Architecture"),
    ).toBeInTheDocument();
    expect(screen.getByText("20/05/2026")).toBeInTheDocument();
    expect(screen.getByText("42 submissions")).toBeInTheDocument();
  });
});
