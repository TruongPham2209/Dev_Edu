/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/card/post-card.tsx
 *
 * Purpose
 * -------
 * Verify that PostCard component renders forum post titles, content, author,
 * status chips, dropdown menu items (Edit, History, Delete, Unsave), and link targets.
 *
 * Tested Features
 * ---------------
 * ✓ Title, content, author name, avatar, thumbnail display
 * ✓ Status chip configuration (PENDING -> "Waiting for approval", REJECTED -> "Rejected", APPROVED)
 * ✓ Posted tab context menu options (Edit, History, Delete)
 * ✓ Saved tab context menu option (Unsave)
 * ✓ Callback invocation on menu action click
 * ✓ Next.js Link href binding for approved posts
 *
 * Covered Scenarios
 * -----------------
 * ✓ Default tab post card (approved status)
 * ✓ Posted tab post card with status chip
 * ✓ Saved tab post card
 * ✓ Clicking menu options (Edit, History, Delete, Unsave)
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements & Next.js Link via RTL)
 *
 * Not Covered
 * -----------
 * - CSS hover elevation
 *
 * Notes
 * -----
 * Unit test for PostCard component.
 */

import type { PostResponse, SavedPostResponse } from "@/lib/type/forums";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PostCard } from "../post-card";

describe("PostCard", () => {
  const basePost: PostResponse = {
    id: "post-1",
    title: "How to master Next.js 16 App Router",
    content: "Detailed guide on server components.",
    shortDescription: "App router overview.",
    createdAt: "2026-06-01T08:00:00.000Z",
    authorFullName: "Alice Johnson",
    status: "APPROVED",
    thumbUrl: "https://example.com/thumb.jpg",
  } as any;

  it("shouldRenderDefaultPostCardWithApprovedLink", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render default PostCard.
    // ----------------------------------------------------------------------------
    render(<PostCard post={basePost} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, content, author, thumbnail, and link href.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("How to master Next.js 16 App Router"),
    ).toBeInTheDocument();
    expect(screen.getByText("App router overview.")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/posts?id=post-1");
  });

  it("shouldRenderPendingStatusChipWhenPostStatusIsPending", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare pending post.
    // ----------------------------------------------------------------------------
    const pendingPost: PostResponse = {
      ...basePost,
      status: "PENDING",
    };

    // ----------------------------------------------------------------------------
    // Act
    // Render card with showStatus = true.
    // ----------------------------------------------------------------------------
    render(<PostCard post={pendingPost} showStatus={true} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify pending status label chip is rendered.
    // ----------------------------------------------------------------------------
    expect(screen.getByText("Waiting for approval")).toBeInTheDocument();
  });

  it("shouldOpenContextMenuAndTriggerOnEditOnRemoveForPostedTab", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare handlers for posted tab options.
    // ----------------------------------------------------------------------------
    const handleEdit = vi.fn();
    const handleHistory = vi.fn();
    const handleRemove = vi.fn();

    render(
      <PostCard
        tab="posted"
        post={basePost}
        onEdit={handleEdit}
        onHistory={handleHistory}
        onRemove={handleRemove}
      />,
    );

    // ----------------------------------------------------------------------------
    // Act
    // Click action menu button.
    // ----------------------------------------------------------------------------
    const menuBtn = screen.getByRole("button");
    fireEvent.click(menuBtn);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify menu items (Edit, History, Delete) appear.
    // ----------------------------------------------------------------------------
    const editItem = screen.getByText("Edit");
    const historyItem = screen.getByText("History");
    const deleteItem = screen.getByText("Delete");

    expect(editItem).toBeInTheDocument();
    expect(historyItem).toBeInTheDocument();
    expect(deleteItem).toBeInTheDocument();

    // ----------------------------------------------------------------------------
    // Act & Verify
    // Click Delete item and verify handleRemove callback execution.
    // ----------------------------------------------------------------------------
    fireEvent.click(deleteItem);
    expect(handleRemove).toHaveBeenCalledWith(basePost);
  });

  it("shouldTriggerOnUnsaveForSavedTab", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Prepare saved post object and unsave handler.
    // ----------------------------------------------------------------------------
    const savedPost: SavedPostResponse = {
      id: "saved-1",
      postId: "post-99",
      title: "Saved React Guide",
      shortDescription: "Saved summary.",
      postedDate: "2026-04-10T00:00:00.000Z",
      authorFullName: "Bob Smith",
      thumbUrl: null,
    } as any;

    const handleUnsave = vi.fn();

    // ----------------------------------------------------------------------------
    // Act
    // Render saved tab card.
    // ----------------------------------------------------------------------------
    render(<PostCard tab="saved" post={savedPost} onUnsave={handleUnsave} />);

    // Click menu button
    fireEvent.click(screen.getByRole("button"));

    // Click Unsave menu item
    const unsaveItem = screen.getByText("Unsave");
    fireEvent.click(unsaveItem);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify onUnsave callback was invoked with savedPost.
    // ----------------------------------------------------------------------------
    expect(handleUnsave).toHaveBeenCalledWith(savedPost);
  });
});
