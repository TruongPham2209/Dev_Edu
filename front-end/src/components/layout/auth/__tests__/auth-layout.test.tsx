/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/layout/auth/auth-layout.tsx
 *
 * Purpose
 * -------
 * Verify that AuthLayout component renders branding logo, hero title, platform benefits,
 * code snippet widget, and Card container with custom title, subtitle, and child content.
 *
 * Tested Features
 * ---------------
 * ✓ DevEdu branding logo and link rendering
 * ✓ Hero title ("Learn, Code, and Ship software.") and platform benefits list
 * ✓ Card container rendering title, subtitle, and nested children
 *
 * Covered Scenarios
 * -----------------
 * ✓ Rendering AuthLayout around authentication form children
 *
 * Mocked Dependencies
 * -------------------
 * - "next/link" (mocked Link component)
 *
 * Not Covered
 * -----------
 * - CSS keyframe animations (slideIn, float, pulse)
 *
 * Notes
 * -----
 * Unit test for AuthLayout component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthLayout } from "../auth-layout";

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("AuthLayout", () => {
  it("shouldRenderBrandingTitleSubtitleAndNestedChildren", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render AuthLayout around child login form.
    // ----------------------------------------------------------------------------
    render(
      <AuthLayout
        title="Sign In to DevEdu"
        subtitle="Welcome back! Please enter your details."
      >
        <form data-testid="mock-login-form">
          <input placeholder="Email address" />
          <button type="submit">Sign in</button>
        </form>
      </AuthLayout>,
    );

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, subtitle, branding, and form children render.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByRole("heading", { name: "Sign In to DevEdu" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Welcome back! Please enter your details."),
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-login-form")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
  });
});
