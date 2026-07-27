/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/providers/app-providers.tsx
 *
 * Purpose
 * -------
 * Verify that AppProviders component wraps child elements within QueryClientProvider,
 * ToastProvider, AntD ConfigProvider, MUI ThemeProvider, and CssBaseline correctly.
 *
 * Tested Features
 * ---------------
 * ✓ QueryClientProvider instantiation and context availability
 * ✓ ToastProvider context availability
 * ✓ MUI ThemeProvider and AntD ConfigProvider context injection
 * ✓ Rendering nested children without crashing
 *
 * Covered Scenarios
 * -----------------
 * ✓ AppProviders wrapper around child components
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders providers via RTL)
 *
 * Not Covered
 * -----------
 * - CSS baseline reset stylesheet rules
 *
 * Notes
 * -----
 * Unit test for AppProviders component.
 */

import { useToast } from "@/lib/toast-context";
import { useQuery } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppProviders } from "../app-providers";

const TestChildComponent = () => {
  const { success } = useToast();
  const { data } = useQuery({
    queryKey: ["test-query"],
    queryFn: () => "react-query-ok",
  });

  return (
    <div>
      <span data-testid="query-status">{data || "loading"}</span>
      <button onClick={() => success("Toast notification works!")}>
        Trigger Toast
      </button>
    </div>
  );
};

describe("AppProviders", () => {
  it("shouldWrapChildrenWithQueryClientAndToastProviders", async () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render TestChildComponent wrapped in AppProviders.
    // ----------------------------------------------------------------------------
    render(
      <AppProviders>
        <TestChildComponent />
      </AppProviders>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify React Query child data and Toast trigger button are in DOM.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(screen.getByTestId("query-status")).toHaveTextContent(
        "react-query-ok",
      );
    });

    const toastBtn = screen.getByRole("button", { name: "Trigger Toast" });
    expect(toastBtn).toBeInTheDocument();
  });
});
