/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/quiz/session-lock-dialog.tsx
 *
 * Purpose
 * -------
 * Verify that SessionLockDialog renders session conflict title, warning message,
 * and navigates to home when clicking "Back to Home".
 *
 * Tested Features
 * ---------------
 * ✓ Rendering lock message and warning banner when session is locked
 * ✓ Navigation action trigger to return to home page
 *
 * Covered Scenarios
 * -----------------
 * ✓ Session locked state rendering with message
 * ✓ User interaction with navigation button
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 *
 * Not Covered
 * -----------
 * - CSS animation transitions
 *
 * Notes
 * -----
 * Unit test for SessionLockDialog component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SessionLockDialog } from "../session-lock-dialog";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("SessionLockDialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldRenderDialogTitleAndMessageWhenOpen", () => {
    render(
      <SessionLockDialog
        open={true}
        message="Your exam is active on another device."
      />,
    );

    expect(screen.getByText("Session Conflict!")).toBeInTheDocument();
    expect(
      screen.getByText("Your exam is active on another device."),
    ).toBeInTheDocument();
  });

  it("shouldNavigateHomeWhenClickingBackToHomeButton", () => {
    render(<SessionLockDialog open={true} />);

    const button = screen.getByRole("button", { name: /Back to Home/i });
    fireEvent.click(button);

    expect(mockPush).toHaveBeenCalledWith("/home");
  });
});
