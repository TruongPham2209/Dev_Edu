/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/layout/web-layout.tsx
 *
 * Purpose
 * -------
 * Verify that StudentLayout component renders StudentHeader and wraps children within Container.
 *
 * Tested Features
 * ---------------
 * ✓ StudentHeader rendering
 * ✓ Main container element wrapping nested student page children
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering StudentLayout around student page children
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/layout/components/student-header" (mocked StudentHeader)
 *
 * Not Covered
 * -----------
 * - CSS responsive spacing
 *
 * Notes
 * -----
 * Unit test for StudentLayout component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudentLayout } from "../web-layout";

vi.mock("@/components/components/student-header", () => ({
  StudentHeader: () => (
    <header data-testid="student-header">Student Navigation Header</header>
  ),
}));

describe("StudentLayout", () => {
  it("shouldRenderStudentHeaderAndChildren", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render StudentLayout around child content.
    // ----------------------------------------------------------------------------
    render(
      <StudentLayout>
        <div data-testid="student-page-content">Main Student Content</div>
      </StudentLayout>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify StudentHeader and child content render.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("student-header")).toBeInTheDocument();
    expect(screen.getByTestId("student-page-content")).toBeInTheDocument();
  });
});
