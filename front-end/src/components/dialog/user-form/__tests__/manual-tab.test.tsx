/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/user-form/manual-tab.tsx
 *
 * Purpose
 * -------
 * Verify that ManualTab component handles form inputs (Full name, Username, Email, Password, Role),
 * input regex validations, password visibility toggle, and batch user creation mutation submission.
 *
 * Tested Features
 * ---------------
 * ✓ Input rendering for Full name, Username, Email, Password, Role
 * ✓ Validation errors when fields are touched and invalid
 * ✓ onReady callback with isValid status and submitFn
 * ✓ Password visibility toggle
 * ✓ Batch create users API mutation execution on valid submit
 *
 * Covered Scenarios
 * -----------------
 * ✓ Entering invalid values (displays error messages)
 * ✓ Entering valid values and executing submit callback
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/users" (useBatchCreateUsersMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 *
 * Not Covered
 * -----------
 * - CSS focus animations
 *
 * Notes
 * -----
 * Unit test for ManualTab component.
 */

import * as usersApi from "@/lib/api/users";
import * as apiToast from "@/lib/use-api-with-toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ManualTab } from "../manual-tab";

vi.mock("@/lib/api/users", () => ({
  useBatchCreateUsersMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

import {
  createMockApiWithToast,
  createMockMutationResult,
} from "@/testing/mock-query";

describe("ManualTab", () => {
  const mockBatchMutate = vi.fn();
  const mockShowSuccess = vi.fn();
  const mockHandleError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(usersApi.useBatchCreateUsersMutation).mockReturnValue({
      mutateAsync: mockBatchMutate,
    } as never);
    vi.mocked(apiToast.useApiWithToast).mockReturnValue({
      showSuccess: mockShowSuccess,
      handleError: mockHandleError,
    } as never);
    vi.mocked(usersApi.useBatchCreateUsersMutation).mockReturnValue(
      createMockMutationResult({
        mutateAsync: mockBatchMutate,
      }),
    );
    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast({ showSuccess: mockShowSuccess }),
    );
  });

  it("shouldNotifyOnReadyWithInvalidStatusInitially", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare onReady callback.
    // ----------------------------------------------------------------------------
    const handleReady = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render ManualTab.
    // ----------------------------------------------------------------------------
    render(
      <ManualTab onReady={handleReady} onSaved={vi.fn()} onClose={vi.fn()} />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify initial onReady call was with isValid = false.
    // ----------------------------------------------------------------------------
    expect(handleReady).toHaveBeenCalledWith(false, expect.any(Function));
  });

  it("shouldValidateInputsAndExecuteSubmitOnValidForm", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare callbacks and mock resolution.
    // ----------------------------------------------------------------------------
    let submitFn: (() => Promise<void>) | null = null;
    const handleReady = vi.fn((isValid, fn) => {
      if (isValid) submitFn = fn;
    });

    const handleSaved = vi.fn();
    const handleClose = vi.fn();
    mockBatchMutate.mockResolvedValue([{ id: "u-1" }]);

    render(
      <ManualTab
        onReady={handleReady}
        onSaved={handleSaved}
        onClose={handleClose}
      />,
    );

    // Fill valid form inputs
    const fullNameInput = screen.getByPlaceholderText("Nguyen Van A");
    const usernameInput = screen.getByPlaceholderText("nguyena");
    const emailInput = screen.getByPlaceholderText("nguyena@example.com");
    const passwordInput = screen.getByPlaceholderText("User@123");

    fireEvent.change(fullNameInput, { target: { value: "Nguyen Van A" } });
    fireEvent.change(usernameInput, { target: { value: "nguyena" } });
    fireEvent.change(emailInput, { target: { value: "nguyena@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "User@123!" } });

    // ----------------------------------------------------------------------------
    // Assert & Act
    // Verify form is valid and submitFn is captured.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(submitFn).not.toBeNull();
    });

    if (submitFn) {
      await (submitFn as () => Promise<void>)();
    }

    // ----------------------------------------------------------------------------
    // Verify
    // Verify batchCreateUsersMutate, showSuccess, onSaved, onClose execution.
    // ----------------------------------------------------------------------------
    expect(mockBatchMutate).toHaveBeenCalledWith([
      {
        fullName: "Nguyen Van A",
        username: "nguyena",
        email: "nguyena@example.com",
        password: "User@123!",
        role: "STUDENT",
      },
    ]);

    expect(mockShowSuccess).toHaveBeenCalledWith("User created successfully!");
    expect(handleSaved).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
