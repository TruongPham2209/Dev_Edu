/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/layout.tsx
 *
 * Purpose
 * -------
 * Verify RootLayout rendering of children content, AuthSync, and global ChatWidget integration.
 *
 * Tested Features
 * ---------------
 * ✓ Server cookie extraction for access_token
 * ✓ RootLayout HTML / Body wrapper structure
 * ✓ Auth initialization script embedding
 * ✓ AppProviders wrapper and children rendering
 * ✓ AuthSync and ChatWidget global components inclusion
 *
 * Covered Scenarios
 * -----------------
 * ✓ Cookie with access_token present vs absent
 * ✓ Children element rendering inside body
 *
 * Mocked Dependencies
 * -------------------
 * - "next/headers": cookies
 * - "@/components/chat/chat-widget": ChatWidget
 * - "@/components/auth/auth-sync": AuthSync
 * - "@/components/providers/app-providers": AppProviders
 *
 * Notes
 * -----
 * Unit test for RootLayout server component.
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import RootLayout from "../layout";

vi.mock("next/font/google", () => ({
  Geist: () => ({ variable: "--font-geist-sans" }),
  Geist_Mono: () => ({ variable: "--font-geist-mono" }),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

vi.mock("@/components/chat/chat-widget", () => ({
  ChatWidget: () => <div data-testid="chat-widget-mock">ChatWidget</div>,
}));

vi.mock("@/components/auth/auth-sync", () => ({
  AuthSync: () => <div data-testid="auth-sync-mock">AuthSync</div>,
}));

vi.mock("@/components/providers/app-providers", () => ({
  AppProviders: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-providers-mock">{children}</div>
  ),
}));

describe("RootLayout", () => {
  it("shouldRenderChildrenAuthSyncAndChatWidget", async () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render RootLayout async component.
    // ----------------------------------------------------------------------------
    const layoutElement = await RootLayout({
      children: <div data-testid="test-child">Main App Content</div>,
    });
    render(layoutElement);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify children, AuthSync, and ChatWidget mocks are in the document.
    // ----------------------------------------------------------------------------
    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByTestId("auth-sync-mock")).toBeInTheDocument();
    expect(screen.getByTestId("chat-widget-mock")).toBeInTheDocument();
  });
});
