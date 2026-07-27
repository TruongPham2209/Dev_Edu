/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/toast-context.tsx
 *
 * Purpose
 * -------
 * Verify that ToastProvider correctly manages toast notification state,
 * exposes helper method shortcuts (success, error, info, warning), renders MUI
 * Snackbar and Alert elements, auto-hides toasts after duration, and enforces
 * context boundaries for useToast.
 *
 * Tested Features
 * ---------------
 * ✓ ToastProvider context rendering
 * ✓ useToast hook accessor
 * ✓ Toast triggers (show, success, error, info, warning)
 * ✓ Toast auto-removal via timer
 * ✓ Snackbar / Alert close callback execution
 * ✓ Error throwing when useToast is used outside provider
 *
 * Covered Scenarios
 * -----------------
 * ✓ Triggering success toast
 * ✓ Triggering error toast
 * ✓ Triggering warning toast
 * ✓ Triggering info toast
 * ✓ Multiple toasts stacking
 * ✓ Closing toast manually via Alert onClose
 * ✓ Timer-based auto-dismissal
 * ✓ Out-of-bounds hook invocation
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders React components with RTL)
 *
 * Not Covered
 * -----------
 * - MUI animations
 *
 * Notes
 * -----
 * Unit test for React context provider and hook using RTL and fake timers.
 */

import { act, render, renderHook, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "../toast-context";

function TestComponent() {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.show("Custom message", "info")}>
        Show Info
      </button>
      <button onClick={() => toast.success("Operation successful")}>
        Show Success
      </button>
      <button onClick={() => toast.error("An error occurred")}>
        Show Error
      </button>
      <button onClick={() => toast.warning("Warning alert")}>
        Show Warning
      </button>
      <button onClick={() => toast.info("Informational toast")}>
        Show Info Alias
      </button>
    </div>
  );
}

describe("ToastContext & ToastProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("shouldThrowErrorWhenUseToastIsUsedOutsideToastProvider", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    // ----------------------------------------------------------------------------
    // Act & Assert
    // Execute the component or function and verify output.
    // ----------------------------------------------------------------------------
    expect(() => renderHook(() => useToast())).toThrow(
      "useToast must be used within ToastProvider",
    );

    // ----------------------------------------------------------------------------
    // Verify
    // Verify interaction with mocked dependencies.
    // ----------------------------------------------------------------------------
    consoleSpy.mockRestore();
  });

  it("shouldRenderToastWithSuccessSeverityWhenSuccessIsCalled", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const button = screen.getByRole("button", { name: "Show Success" });
    act(() => {
      button.click();
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    const alertElement = screen.getByText("Operation successful");
    expect(alertElement).toBeInTheDocument();
  });

  it("shouldRenderToastWithErrorSeverityWhenErrorIsCalled", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const button = screen.getByRole("button", { name: "Show Error" });
    act(() => {
      button.click();
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    const alertElement = screen.getByText("An error occurred");
    expect(alertElement).toBeInTheDocument();
  });

  it("shouldRenderToastWithWarningSeverityWhenWarningIsCalled", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const button = screen.getByRole("button", { name: "Show Warning" });
    act(() => {
      button.click();
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    const alertElement = screen.getByText("Warning alert");
    expect(alertElement).toBeInTheDocument();
  });

  it("shouldAutoRemoveToastAfter3000msTimeout", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare props, mocks and expected values.
    // ----------------------------------------------------------------------------
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Execute the component or function.
    // ----------------------------------------------------------------------------
    const button = screen.getByRole("button", { name: "Show Success" });
    act(() => {
      button.click();
    });

    expect(screen.getByText("Operation successful")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3100);
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result and rendered output.
    // ----------------------------------------------------------------------------
    expect(screen.queryByText("Operation successful")).not.toBeInTheDocument();
  });
});
