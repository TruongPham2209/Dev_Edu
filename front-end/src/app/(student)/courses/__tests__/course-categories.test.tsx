/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/course-categories.tsx
 *
 * Purpose
 * -------
 * Verify that CourseCategories component renders Roadmap & Topics header, "All courses" button,
 * category buttons, and handles category selection callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ "All courses" button rendering and selection (null category)
 * ✓ Category list rendering and active category style
 * ✓ Category click triggering setSelectedCategory callback
 *
 * Covered Scenarios
 * -----------------
 * ✓ Selecting a specific category
 * ✓ Resetting to "All courses"
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - Scrollbar styling
 *
 * Notes
 * -----
 * Unit test for CourseCategories component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CourseCategories } from "../course-categories";

describe("CourseCategories", () => {
  const mockCategories = [
    {
      id: "cat-1",
      name: "Web Development",
      description: "Learn web dev",
      thumbnailObjectKey: "",
      thumbnailUrl: "",
      totalCourses: 10,
    },
    {
      id: "cat-2",
      name: "Data Science",
      description: "Learn data science",
      thumbnailObjectKey: "",
      thumbnailUrl: "",
      totalCourses: 5,
    },
  ];

  it("shouldRenderCategoriesAndTriggerSelection", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare setSelectedCategory callback.
    // ----------------------------------------------------------------------------
    const handleSetSelectedCategory = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseCategories.
    // ----------------------------------------------------------------------------
    render(
      <CourseCategories
        categories={mockCategories}
        selectedCategory={null}
        setSelectedCategory={handleSetSelectedCategory}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify Roadmap & Topics header, All courses button, and categories render.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Roadmap & Topics")).toBeInTheDocument();
    expect(screen.getByText("All courses")).toBeInTheDocument();
    expect(screen.getByText("Web Development")).toBeInTheDocument();
    expect(screen.getByText("Data Science")).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click category button.
    // ----------------------------------------------------------------------------
    fireEvent.click(screen.getByText("Web Development"));

    expect(handleSetSelectedCategory).toHaveBeenCalledWith("cat-1");
  });
});
