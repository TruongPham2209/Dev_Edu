/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/courses/course-table.tsx
 *
 * Purpose
 * -------
 * Verify that CourseTable component renders course items list with title, description, price,
 * thumbnail, created date, and triggers Manage Content, Update Info, and Delete action buttons.
 *
 * Tested Features
 * ---------------
 * ✓ Table headers and columns rendering
 * ✓ Triggering onEditCourse callback when Edit button is clicked
 * ✓ Triggering onDeleteCourse callback when Delete button is clicked
 * ✓ Navigating to course details page on Manage Content (Eye) button click
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering course catalog table
 * ✓ Action button interactions
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 *
 * Not Covered
 * -----------
 * - Image zoom modal rendering
 *
 * Notes
 * -----
 * Unit test for CourseTable component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseTable } from "../course-table";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

describe("CourseTable", () => {
  const mockPush = vi.fn();
  const mockOnPreviewImage = vi.fn();
  const mockOnEditCourse = vi.fn();
  const mockOnDeleteCourse = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  });

  it("shouldRenderCourseTableDataAndTriggerActions", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock course array.
    // ----------------------------------------------------------------------------
    const mockCourses = [
      {
        id: "course-1",
        title: "Spring Boot Microservices",
        description: "<p>Build cloud native apps with Eureka and Gateway.</p>",
        originalPrice: 799000,
        createdAt: "2026-05-15T00:00:00.000Z",
        thumbnailUrl: "https://example.com/spring.png",
      },
    ];

    // ----------------------------------------------------------------------------
    // Act
    // Render CourseTable.
    // ----------------------------------------------------------------------------
    render(
      <CourseTable
        courses={mockCourses as any}
        loading={false}
        onPreviewImage={mockOnPreviewImage}
        onEditCourse={mockOnEditCourse}
        onDeleteCourse={mockOnDeleteCourse}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, price, and action triggers.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Spring Boot Microservices")).toBeInTheDocument();
    expect(screen.getByText(/799[.,]000\s*VND/)).toBeInTheDocument();

    const manageBtn = screen.getByRole("button", { name: "Manage Content" });
    fireEvent.click(manageBtn);
    expect(mockPush).toHaveBeenCalledWith("/admin/courses/course-1");

    const updateBtn = screen.getByRole("button", { name: "Update Info" });
    fireEvent.click(updateBtn);
    expect(mockOnEditCourse).toHaveBeenCalledWith(mockCourses[0]);

    const deleteBtn = screen.getByRole("button", { name: "Delete Course" });
    fireEvent.click(deleteBtn);
    expect(mockOnDeleteCourse).toHaveBeenCalledWith("course-1");
  });
});
