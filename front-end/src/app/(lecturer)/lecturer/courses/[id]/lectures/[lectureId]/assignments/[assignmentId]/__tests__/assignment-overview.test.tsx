/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/lectures/[lectureId]/assignments/[assignmentId]/assignment-overview.tsx
 *
 * Purpose
 * -------
 * Verify that AssignmentOverview component renders "Requirements & Content" header title and HTML assignment requirements content.
 *
 * Tested Features
 * ---------------
 * ✓ Rendering Requirements & Content title
 * ✓ Rendering HTML description content safely using dangerouslySetInnerHTML
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering assignment requirements overview tab
 *
 * Mocked Dependencies
 * -------------------
 * - None
 *
 * Not Covered
 * -----------
 * - Code syntax highlighting engine
 *
 * Notes
 * -----
 * Unit test for AssignmentOverview component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AssignmentOverview } from "../assignment-overview";

describe("AssignmentOverview", () => {
  it("shouldRenderRequirementsHeaderAndHTMLContent", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock assignment data.
    // ----------------------------------------------------------------------------
    const mockAssignment = {
      id: "assign-100",
      title: "Clean Code Assignment",
      description:
        "<h3>Task Instructions</h3><p>Refactor legacy code into clean SOLID principles.</p>",
      createdAt: "2026-06-01T00:00:00.000Z",
    };

    // ----------------------------------------------------------------------------
    // Act
    // Render AssignmentOverview.
    // ----------------------------------------------------------------------------
    render(<AssignmentOverview assignment={mockAssignment as any} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify header title and description rendering.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Requirements & Content")).toBeInTheDocument();
    expect(screen.getByText("Task Instructions")).toBeInTheDocument();
    expect(
      screen.getByText("Refactor legacy code into clean SOLID principles."),
    ).toBeInTheDocument();
  });
});
