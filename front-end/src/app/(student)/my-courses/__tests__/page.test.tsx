/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/my-courses/page.tsx
 *
 * Purpose
 * -------
 * Verify that MyCoursesPage renders header title ("Your learning space") and
 * integrates the EnrollmentList component.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering ("Your learning space")
 * ✓ EnrollmentList component integration
 *
 * Covered Scenarios
 * -----------------
 * ✓ MyCoursesPage rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "../enrollment-list" (mocked EnrollmentList)
 *
 * Not Covered
 * -----------
 * - Layout container padding and responsive styles
 *
 * Notes
 * -----
 * Unit test for MyCoursesPage component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MyCoursesPage from "../page";

vi.mock("../enrollment-list", () => ({
  EnrollmentList: () => (
    <div data-testid="enrollment-list">EnrollmentList Component</div>
  ),
}));

describe("MyCoursesPage", () => {
  it("shouldRenderHeaderTitleAndEnrollmentList", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render MyCoursesPage.
    // ----------------------------------------------------------------------------
    render(<MyCoursesPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and EnrollmentList component render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Your learning space" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("enrollment-list")).toBeInTheDocument();
  });
});
