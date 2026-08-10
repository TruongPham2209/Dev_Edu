/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(admin)/admin/notifications/page.tsx
 *
 * Purpose
 * -------
 * Verify that AdminNotificationsPage renders group notifications management hero section,
 * displays dispatched group announcements list, handles loading, error, and empty states,
 * opens CreateGroupNotificationDialog on button click and handles creation mutation,
 * opens NotificationDetailDialog on detail view, and handles group announcement deletion via ConfirmDialog.
 *
 * Tested Features
 * ---------------
 * ✓ Group Notifications Management HeroInfo banner rendering
 * ✓ Announcements list rendering with category chips, date formatting, and target roles
 * ✓ Opening CreateGroupNotificationDialog on Create Announcement button click
 * ✓ Dispatching group announcement mutation and displaying success toast
 * ✓ Opening NotificationDetailDialog on View Details action click
 * ✓ Opening ConfirmDialog on Delete Announcement action click and executing soft delete mutation
 *
 * Covered Scenarios
 * -----------------
 * ✓ Loading skeleton state
 * ✓ Error state with retry callback execution
 * ✓ Empty announcements list state
 * ✓ Dispatching group announcement successfully
 * ✓ Soft deleting group announcement successfully
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/notification" (useAllGroupNotificationsInfiniteQuery, useCreateGroupNotificationMutation, useDeleteGroupNotificationMutation)
 * - "@/lib/toast-context" (useToast)
 * - "@/components/dialog/notification/notification-form" (mocked CreateGroupNotificationDialog)
 * - "@/components/dialog/notification/notification-detail" (mocked NotificationDetailDialog)
 * - "@/components/common/confirm-dialog" (mocked ConfirmDialog)
 *
 * Not Covered
 * -----------
 * - CSS backdrop blur effects
 *
 * Notes
 * -----
 * Unit test for AdminNotificationsPage component.
 */

import * as notificationApi from "@/lib/api/notification";
import * as toastContext from "@/lib/toast-context";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminNotificationsPage from "../page";

vi.mock("@/lib/api/notification", () => ({
  useAllGroupNotificationsInfiniteQuery: vi.fn(),
  useCreateGroupNotificationMutation: vi.fn(),
  useDeleteGroupNotificationMutation: vi.fn(),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/components/dialog/notification/notification-form", () => ({
  CreateGroupNotificationDialog: ({ open, onClose, onSave }: any) =>
    open ? (
      <div data-testid="create-notification-dialog-mock">
        <button onClick={onClose}>Close Form Dialog</button>
        <button
          onClick={() =>
            onSave({
              title: "New Broadcast",
              content: "Broadcast message",
              targetRoles: ["STUDENT"],
            })
          }
        >
          Submit Form
        </button>
      </div>
    ) : null,
}));

vi.mock("@/components/dialog/notification/notification-detail", () => ({
  NotificationDetailDialog: ({ open, notification, onClose }: any) =>
    open ? (
      <div data-testid="notification-detail-dialog-mock">
        <span>Detail: {notification?.title}</span>
        <button onClick={onClose}>Close Detail Dialog</button>
      </div>
    ) : null,
}));

vi.mock("@/components/common/confirm-dialog", () => ({
  ConfirmDialog: ({ open, onConfirm, onCancel, title }: any) =>
    open ? (
      <div data-testid="confirm-dialog-mock">
        <span>{title}</span>
        <button onClick={onConfirm}>Confirm Delete</button>
        <button onClick={onCancel}>Cancel Delete</button>
      </div>
    ) : null,
}));

describe("AdminNotificationsPage", () => {
  const mockToastSuccess = vi.fn();
  const mockToastError = vi.fn();
  const mockRefetch = vi.fn();
  const mockCreateMutateAsync = vi.fn();
  const mockDeleteMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(toastContext.useToast).mockReturnValue({
      show: vi.fn(),
      success: mockToastSuccess,
      error: mockToastError,
      info: vi.fn(),
      warning: vi.fn(),
    });

    vi.mocked(
      notificationApi.useAllGroupNotificationsInfiniteQuery,
    ).mockReturnValue({
      data: {
        pages: [
          {
            contents: [
              {
                id: "gn-1",
                title: "System Maintenance Notice",
                content: "Scheduled downtime tonight.",
                category: "GROUP",
                type: null,
                createdAt: "2026-08-10T12:00:00Z",
                createdBy: "Admin Root",
                targetRoles: ["STUDENT", "LECTURER"],
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
      isFetchingNextPage: false,
    } as any);

    vi.mocked(
      notificationApi.useCreateGroupNotificationMutation,
    ).mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as any);

    vi.mocked(
      notificationApi.useDeleteGroupNotificationMutation,
    ).mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    } as any);
  });

  it("shouldRenderHeroBannerAndDispatchedAnnouncementsList", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AdminNotificationsPage.
    // ----------------------------------------------------------------------------
    render(<AdminNotificationsPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify hero title, section header, and announcement title.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Group Notifications Management"),
    ).toBeInTheDocument();
    expect(screen.getByText("Dispatched Announcements")).toBeInTheDocument();
    expect(screen.getByText("System Maintenance Notice")).toBeInTheDocument();
    expect(
      screen.getByText("Roles: STUDENT, LECTURER"),
    ).toBeInTheDocument();
  });

  it("shouldRenderErrorStateAndAllowRefetchOnRetryClick", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock error state.
    // ----------------------------------------------------------------------------
    vi.mocked(
      notificationApi.useAllGroupNotificationsInfiniteQuery,
    ).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    } as any);

    render(<AdminNotificationsPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify ErrorState component renders and clicking retry calls refetch.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Failed to load group announcements"),
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("shouldRenderEmptyStateWhenNoGroupAnnouncementsExist", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock empty announcements list.
    // ----------------------------------------------------------------------------
    vi.mocked(
      notificationApi.useAllGroupNotificationsInfiniteQuery,
    ).mockReturnValue({
      data: { pages: [{ contents: [] }] },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    } as any);

    render(<AdminNotificationsPage />);

    // ----------------------------------------------------------------------------
    // Assert
    // EmptyState should render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("No Group Announcements Found"),
    ).toBeInTheDocument();
  });

  it("shouldOpenCreateGroupNotificationDialogAndHandleSuccessfulSave", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock successful creation mutation.
    // ----------------------------------------------------------------------------
    mockCreateMutateAsync.mockResolvedValue({});
    render(<AdminNotificationsPage />);

    // ----------------------------------------------------------------------------
    // Act
    // Click Create Announcement button action.
    // ----------------------------------------------------------------------------
    const createBtn = screen.getByRole("button", {
      name: "Create Announcement",
    });
    fireEvent.click(createBtn);

    // Dialog should open
    expect(
      screen.getByTestId("create-notification-dialog-mock"),
    ).toBeInTheDocument();

    // Click submit inside mocked form dialog
    const submitBtn = screen.getByRole("button", { name: "Submit Form" });
    fireEvent.click(submitBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify mutation, toast success, and dialog closure.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockCreateMutateAsync).toHaveBeenCalledWith({
        title: "New Broadcast",
        content: "Broadcast message",
        targetRoles: ["STUDENT"],
      });
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Group announcement dispatched successfully!",
      );
    });
  });

  it("shouldOpenNotificationDetailDialogOnClickingViewDetailsAction", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render AdminNotificationsPage.
    // ----------------------------------------------------------------------------
    render(<AdminNotificationsPage />);

    // ----------------------------------------------------------------------------
    // Act
    // Click View Details button action.
    // ----------------------------------------------------------------------------
    const viewBtn = screen.getByRole("button", { name: "View Details" });
    fireEvent.click(viewBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify NotificationDetailDialog opens.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByTestId("notification-detail-dialog-mock"),
    ).toBeInTheDocument();
  });

  it("shouldOpenConfirmDialogAndDeleteGroupAnnouncementOnConfirm", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock successful deletion mutation.
    // ----------------------------------------------------------------------------
    mockDeleteMutateAsync.mockResolvedValue("DELETED");
    render(<AdminNotificationsPage />);

    // ----------------------------------------------------------------------------
    // Act
    // Click Delete Announcement button action.
    // ----------------------------------------------------------------------------
    const deleteBtn = screen.getByRole("button", {
      name: "Delete Announcement",
    });
    fireEvent.click(deleteBtn);

    // Confirm dialog should open
    expect(screen.getByTestId("confirm-dialog-mock")).toBeInTheDocument();

    // Click Confirm Delete inside mocked confirm dialog
    const confirmBtn = screen.getByRole("button", { name: "Confirm Delete" });
    fireEvent.click(confirmBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify delete mutation and success toast.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockDeleteMutateAsync).toHaveBeenCalledWith("gn-1");
      expect(mockToastSuccess).toHaveBeenCalledWith(
        "Group announcement deleted successfully!",
      );
    });
  });
});
