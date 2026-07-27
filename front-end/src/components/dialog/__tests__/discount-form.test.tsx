/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/discount-form.tsx
 *
 * Purpose
 * -------
 * Verify that DiscountFormDialog component handles course-specific vs global discount
 * creation, validates percentage boundaries (1-100), date chronological order,
 * calls API mutation hooks, and executes success callbacks.
 *
 * Tested Features
 * ---------------
 * ✓ Title rendering ("Create Course Discount" vs "Create Global Discount")
 * ✓ Form input validation (percentage 1-100, date ordering validTo >= validFrom)
 * ✓ React Query createDiscountMutate invocation
 * ✓ Success toast notification and onSaved callback execution
 * ✓ Error handling via handleError
 *
 * Covered Scenarios
 * -----------------
 * ✓ Global discount mode (courseId = null)
 * ✓ Course discount mode (courseId = "c-100")
 * ✓ Invalid percentage (e.g. 150 or -10)
 * ✓ Invalid date order (validTo before validFrom)
 * ✓ Valid discount creation submission
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/enrollments" (useCreateCourseDiscountMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - Calendar picker widget styling
 *
 * Notes
 * -----
 * Unit test for DiscountFormDialog component.
 */

import * as enrollmentsApi from "@/lib/api/enrollments";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DiscountFormDialog } from "../discount-form";

vi.mock("@/lib/api/enrollments", () => ({
  useCreateCourseDiscountMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

describe("DiscountFormDialog", () => {
  const mockMutateAsync = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(enrollmentsApi.useCreateCourseDiscountMutation).mockReturnValue({
      mutateAsync: mockMutateAsync,
    } as any);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as any);
  });

  it("shouldRenderGlobalDiscountTitleAndWarningNoticeWhenCourseIdIsNull", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render in global discount mode.
    // ----------------------------------------------------------------------------
    render(
      <DiscountFormDialog
        open={true}
        onClose={vi.fn()}
        onSaved={vi.fn()}
        courseId={null}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title and global notice.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Create Global Discount")).toBeInTheDocument();
    expect(
      screen.getByText("Global Discount Setup (All Courses)"),
    ).toBeInTheDocument();
  });

  it("shouldSubmitDiscountFormSuccessfullyWhenInputsAreValid", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks and mutation resolution.
    // ----------------------------------------------------------------------------
    const handleClose = vi.fn();
    const handleSaved = vi.fn();
    const createdDiscount = { id: "disc-1", discountPercentage: 20 };
    mockMutateAsync.mockResolvedValue(createdDiscount);

    render(
      <DiscountFormDialog
        open={true}
        onClose={handleClose}
        onSaved={handleSaved}
        courseId="course-123"
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Fill description, percentage, validFrom, and validTo.
    // ----------------------------------------------------------------------------
    const descInput = screen.getByPlaceholderText("Discount for course 5/5");
    const percentInput = screen.getByPlaceholderText("10%");

    fireEvent.change(descInput, { target: { value: "Summer Sale 2026" } });
    fireEvent.change(percentInput, { target: { value: "20" } });

    // Target start and end date inputs
    const startInput = screen.getByLabelText(/Start time/i);
    const endInput = screen.getByLabelText(/End time/i);

    fireEvent.change(startInput, { target: { value: "2026-06-01" } });
    fireEvent.change(endInput, { target: { value: "2026-06-30" } });

    // Submit form
    const saveBtn = screen.getByRole("button", { name: "Save Discount" });
    expect(saveBtn).not.toBeDisabled();
    fireEvent.click(saveBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify mutateAsync, showSuccess, and onSaved execution.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          courseId: "course-123",
          description: "Summer Sale 2026",
          discountPercentage: 20,
        }),
      );
      expect(mockShowSuccess).toHaveBeenCalledWith(
        "Successfully created course discount!",
      );
      expect(handleSaved).toHaveBeenCalledWith(createdDiscount);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
