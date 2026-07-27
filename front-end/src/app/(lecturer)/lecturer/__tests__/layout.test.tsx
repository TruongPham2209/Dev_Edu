/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/layout.tsx
 *
 * Purpose
 * -------
 * Verify that Lecturer Layout component wraps children with LecturerLayout provider component.
 *
 * Tested Features
 * ---------------
 * ✓ Layout component rendering nested children inside LecturerLayout
 *
 * Covered Scenarios
 * -----------------
 * ✓ Layout rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/layout/lecturer/page" (mocked LecturerLayout)
 *
 * Not Covered
 * -----------
 * - Next.js Metadata export evaluation
 *
 * Notes
 * -----
 * Unit test for lecturer layout.tsx.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Layout from "../layout";

vi.mock("@/components/layout/lecturer/page", () => ({
  LecturerLayout: ({ children }: any) => (
    <div data-testid="lecturer-layout-wrapper">{children}</div>
  ),
}));

describe("Lecturer Studio Layout", () => {
  it("shouldWrapChildrenInsideLecturerLayout", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render Layout with test children.
    // ----------------------------------------------------------------------------
    render(
      <Layout>
        <div data-testid="test-content">Dashboard Content</div>
      </Layout>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify wrapper and children render.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("lecturer-layout-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("test-content")).toBeInTheDocument();
  });
});
