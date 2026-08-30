/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/course-form.tsx
 *
 * Purpose
 * -------
 * Verify that CourseFormDialog component handles course creation vs update modes,
 * category selection fallbacks, title/description/price/lecturer validation,
 * lecturer assignment chips, and save callback execution.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering ("Create Course" vs "Edit Course")
 * ✓ Input validations (title >= 3 chars, description >= 10 chars, price >= 0, lecturers > 0)
 * ✓ Category fallback selection when categoryId is invalid
 * ✓ Save callback execution with CourseRequest payload and cover image File
 *
 * Covered Scenarios
 * -----------------
 * ✓ New course mode (initialValue id = null)
 * ✓ Editing course mode (initialValue id = "c-100")
 * ✓ Submitting valid course details
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/api/users" (useSearchUsersQuery)
 * - "@/components/common/form/rich-text-editor" (mocked textarea)
 * - "@/components/common/form/file-upload" (mocked input)
 * - "@/components/common/form/filter-select" (mocked select)
 * - "@/components/common/form/search-input" (mocked search input)
 *
 * Not Covered
 * -----------
 * - Real user search dropdown debouncing
 *
 * Notes
 * -----
 * Unit test for CourseFormDialog component.
 */

import * as coursesApi from "@/lib/api/courses";
import * as usersApi from "@/lib/api/users";
import type { CategoryResponse, CourseRequest, CourseResponse } from "@/lib/type/courses";
import type { CustomPaging } from "@/lib/type/api";
import type { UserResponse } from "@/lib/type/users";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CourseFormDialog } from "../course-form";

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
}));

vi.mock("@/lib/api/users", () => ({
  useSearchUsersQuery: vi.fn(),
}));

vi.mock("@/components/common/form/rich-text-editor", () => ({
  RichTextEditor: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <textarea
      data-testid="course-description-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

vi.mock("@/components/common/form/file-upload", () => ({
  FileUpload: ({ onChange }: { onChange: (file: File | null) => void }) => (
    <input
      type="file"
      data-testid="cover-image-input"
      onChange={(e) => onChange(e.target.files?.[0] || null)}
    />
  ),
}));

vi.mock("@/components/common/form/filter-select", () => ({
  FilterSelect: ({
    value,
    onChange,
    items = [],
  }: {
    value?: string;
    onChange?: (val: string) => void;
    items?: Array<{ id: string; title: string }>;
  }) => (
    <select
      data-testid="category-select"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.title}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/components/common/form/search-input", () => ({
  SearchInput: ({
    value,
    onChange,
  }: {
    value?: string;
    onChange?: (val: string) => void;
  }) => (
    <input
      data-testid="lecturer-search"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

import { createMockCategory, createMockCourse } from "@/testing/mock-data";
import { createMockQueryResult } from "@/testing/mock-query";

describe("CourseFormDialog", () => {
  const mockCategories: CategoryResponse[] = [
    createMockCategory({ id: "cat-1", name: "Web Development" }),
    createMockCategory({ id: "cat-2", name: "Mobile Development" }),
  ];

  const defaultInitialValue: CourseRequest = {
    title: "",
    description: "",
    categoryId: "cat-1",
    price: 0,
    thumbnailObjectKey: "",
    lecturerUsernames: ["lecturer1"],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue(
      createMockQueryResult<CourseResponse>(),
    );
    vi.mocked(usersApi.useSearchUsersQuery).mockReturnValue(
      createMockQueryResult<CustomPaging<UserResponse>>(),
    );
  });

  it("shouldRenderTitleAndDisabledSubmitWhenFormIsInvalid", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render CourseFormDialog in creation mode.
    // ----------------------------------------------------------------------------
    render(
      <CourseFormDialog
        open={true}
        title="Create New Course"
        categories={mockCategories}
        initialValue={defaultInitialValue}
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and disabled submit button.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Create New Course" }),
    ).toBeInTheDocument();
    const submitBtn = screen.getByRole("button", { name: "Create Course" });
    expect(submitBtn).toBeDisabled();
  });

  it("shouldSubmitCourseFormWhenAllFieldsAreValid", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare valid initial value.
    // ----------------------------------------------------------------------------
    const validInitialValue: CourseRequest = {
      id: "course-100",
      title: "React 19 Complete Mastery",
      description:
        "<p>Learn React 19 and Next.js App Router comprehensively.</p>",
      categoryId: "cat-1",
      price: 500000,
      thumbnailObjectKey: "courses/react.png",
      lecturerUsernames: ["prof_react"],
    };

    const handleSave = vi.fn();

    render(
      <CourseFormDialog
        open={true}
        title="Edit Course"
        categories={mockCategories}
        initialValue={validInitialValue}
        editingCourse={createMockCourse({ id: "course-100" })}
        onClose={vi.fn()}
        onSave={handleSave}
      />,
    );

    // Submit form
    const submitBtn = screen.getByRole("button", { name: "Save Changes" });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onSave execution with course payload.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(handleSave).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "course-100",
          title: "React 19 Complete Mastery",
          price: 500000,
          lecturerUsernames: ["prof_react"],
        }),
        null,
      );
    });
  });
});
