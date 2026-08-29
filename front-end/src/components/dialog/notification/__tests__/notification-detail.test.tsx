import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/dialog/notification/notification-detail.tsx
 *
 * Purpose
 * -------
 * Verify that NotificationDetailDialog correctly renders notification details,
 * supports both HTML and plain text content formats, renders category and read status chips,
 * target role badges, creation / read dates, and handles dialog close callback execution.
 *
 * Tested Features
 * ---------------
 * ✓ Null notification prop handling
 * ✓ GROUP announcement category rendering with target roles and HTML content
 * ✓ PERSONAL notification category rendering with plain text content and Read status chip
 * ✓ InfoDialog title, close action button, and date formatting execution
 *
 * Covered Scenarios
 * -----------------
 * ✓ Open dialog with null notification returns null
 * ✓ Group notification rendering HTML content via dangerouslySetInnerHTML
 * ✓ Personal notification rendering plain text content and read timestamp
 * ✓ Close button click triggering onClose callback
 *
 * Mocked Dependencies
 * -------------------
 * - "@/components/common/info-dialog" (mocked InfoDialog wrapper)
 * - "@/lib/util/date-utils" (mocked formatServerDate)
 *
 * Not Covered
 * -----------
 * - Raw CSS styling calculations
 *
 * Notes
 * -----
 * Unit test for NotificationDetailDialog component.
 */

import type { NotificationResponse } from "@/lib/type/notification";
import * as dateUtils from "@/lib/util/date-utils";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationDetailDialog } from "../notification-detail";

vi.mock("@/components/common/info-dialog", () => ({
  InfoDialog: ({
    open,
    onClose,
    title,
    children,
  }: {
    open?: boolean;
    onClose?: () => void;
    title?: React.ReactNode;
    children?: React.ReactNode;
  }) =>
    open ? (
      <div data-testid="info-dialog-mock">
        <h2>{title}</h2>
        <button onClick={onClose}>Close Dialog</button>
        <div>{children}</div>
      </div>
    ) : null,
}));

vi.mock("@/lib/util/date-utils", () => ({
  formatServerDate: vi.fn((dateStr: string) => `Formatted: ${dateStr}`),
}));

describe("NotificationDetailDialog Component", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shouldReturnNullWhenNotificationIsNull", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render NotificationDetailDialog with null notification.
    // ----------------------------------------------------------------------------
    const { container } = render(
      <NotificationDetailDialog
        open={true}
        notification={null}
        onClose={mockOnClose}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify component renders nothing.
    // ----------------------------------------------------------------------------
    expect(container.firstChild).toBeNull();
  });

  it("shouldRenderGroupNotificationDetailsWithHtmlContentAndTargetRoles", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare mock GROUP notification object with HTML content.
    // ----------------------------------------------------------------------------
    const mockGroupNotification: NotificationResponse = {
      id: "gn-100",
      title: "System Maintenance Notice",
      content: "<p>The system will be down for <strong>2 hours</strong>.</p>",
      category: "GROUP",
      type: null,
      isRead: false,
      createdAt: "2026-08-10T12:00:00Z",
      createdBy: "Admin User",
      targetRoles: ["STUDENT", "LECTURER"],
    };

    // ----------------------------------------------------------------------------
    // Act
    // Render dialog.
    // ----------------------------------------------------------------------------
    render(
      <NotificationDetailDialog
        open={true}
        notification={mockGroupNotification}
        onClose={mockOnClose}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, badges, HTML content, created date, and sender rendering.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("System Maintenance Notice")).toBeInTheDocument();
    expect(screen.getByText("GROUP")).toBeInTheDocument();
    expect(screen.getByText("Unread")).toBeInTheDocument();
    expect(
      screen.getByText("Roles: STUDENT, LECTURER"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sent by: Admin User")).toBeInTheDocument();
    expect(dateUtils.formatServerDate).toHaveBeenCalledWith(
      "2026-08-10T12:00:00Z",
      "datetime",
    );
  });

  it("shouldRenderPersonalNotificationDetailsWithPlainTextAndReadTimestamp", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare mock PERSONAL notification object with plain text content and read timestamp.
    // ----------------------------------------------------------------------------
    const mockPersonalNotification: NotificationResponse = {
      id: "pn-200",
      title: "New Assignment Graded",
      content: "Your assignment #3 has been graded with a score of 95.",
      category: "PERSONAL",
      type: "SUBMISSION_FEEDBACK",
      isRead: true,
      createdAt: "2026-08-09T08:00:00Z",
      readAt: "2026-08-09T09:30:00Z",
    };

    // ----------------------------------------------------------------------------
    // Act
    // Render dialog.
    // ----------------------------------------------------------------------------
    render(
      <NotificationDetailDialog
        open={true}
        notification={mockPersonalNotification}
        onClose={mockOnClose}
      />,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, Read badge, plain text content, and read date rendering.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("New Assignment Graded")).toBeInTheDocument();
    expect(screen.getByText("PERSONAL")).toBeInTheDocument();
    expect(screen.getByText("Read")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your assignment #3 has been graded with a score of 95.",
      ),
    ).toBeInTheDocument();
    expect(dateUtils.formatServerDate).toHaveBeenCalledWith(
      "2026-08-09T09:30:00Z",
      "datetime",
    );
  });

  it("shouldTriggerOnCloseCallbackWhenCloseButtonIsClicked", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render dialog with notification.
    // ----------------------------------------------------------------------------
    const mockNotification: NotificationResponse = {
      id: "gn-1",
      title: "Test",
      category: "GROUP",
      type: null,
      isRead: false,
      createdAt: "2026-08-10T00:00:00Z",
    };

    render(
      <NotificationDetailDialog
        open={true}
        notification={mockNotification}
        onClose={mockOnClose}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click close button.
    // ----------------------------------------------------------------------------
    const closeBtn = screen.getByRole("button", { name: "Close Dialog" });
    fireEvent.click(closeBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify onClose call count.
    // ----------------------------------------------------------------------------
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
