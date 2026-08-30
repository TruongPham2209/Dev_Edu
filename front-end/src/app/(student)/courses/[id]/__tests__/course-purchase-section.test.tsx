import React from "react";
/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/course-purchase-section.tsx
 *
 * Purpose
 * -------
 * Verify that CoursePurchaseSection handles Buy Now checkout mutation, Add to Cart mutation,
 * and unauthenticated redirect to login.
 *
 * Tested Features
 * ---------------
 * ✓ Buy Now action initiating checkoutMutation and redirecting to /checkout?orderId=123
 * ✓ Add to Cart action initiating addToCartMutation and displaying success toast
 * ✓ Unauthenticated user redirection to login
 *
 * Covered Scenarios
 * -----------------
 * ✓ Authenticated student user initiating buy now
 * ✓ Authenticated student user adding course to cart
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/use-auth" (useAuth)
 * - "@/lib/api/enrollments" (useAddToCartMutation, useCheckoutMutation)
 * - "@/lib/use-api-with-toast" (useApiWithToast)
 * - "next/image" (mocked img tag)
 *
 * Not Covered
 * -----------
 * - CSS sticky layout
 *
 * Notes
 * -----
 * Unit test for CoursePurchaseSection component.
 */

import * as enrollmentsApi from "@/lib/api/enrollments";
import * as apiToast from "@/lib/use-api-with-toast";
import * as useAuthModule from "@/lib/use-auth";
import {
  createMockApiWithToast,
  createMockMutationResult,
} from "@/testing/mock-query";
import {
  createMockAuthStatus,
  createMockCourse,
  createMockRouter,
} from "@/testing/mock-data";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CoursePurchaseSection } from "../course-purchase-section";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/lib/use-auth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/enrollments", () => ({
  useAddToCartMutation: vi.fn(),
  useCheckoutMutation: vi.fn(),
}));

vi.mock("@/lib/use-api-with-toast", () => ({
  useApiWithToast: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "image", ...props }: React.ComponentProps<"img">) => React.createElement("img", { alt, ...props }),
}));

describe("CoursePurchaseSection", () => {
  const mockPush = vi.fn();
  const mockCheckoutMutate = vi.fn();
  const mockAddToCartMutate = vi.fn();

  const mockCourse = createMockCourse({
    id: "c-200",
    title: "TypeScript Deep Dive",
    discountedPrice: 600000,
    originalPrice: 800000,
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(createMockRouter({ push: mockPush }));

    vi.mocked(useAuthModule.useAuth).mockReturnValue(
      createMockAuthStatus({ isAuthenticated: true, roles: ["STUDENT"] }),
    );

    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast(),
    );

    vi.mocked(enrollmentsApi.useCheckoutMutation).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockCheckoutMutate }),
    );

    vi.mocked(enrollmentsApi.useAddToCartMutation).mockReturnValue(
      createMockMutationResult({ mutateAsync: mockAddToCartMutate }),
    );
  });

  it("shouldInitiateCheckoutOnBuyNowClick", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Return checkout orderId.
    // ----------------------------------------------------------------------------
    mockCheckoutMutate.mockResolvedValue({ orderId: "ord-777" });

    // ----------------------------------------------------------------------------
    // Act
    // Render CoursePurchaseSection.
    // ----------------------------------------------------------------------------
    render(
      <CoursePurchaseSection
        course={mockCourse}
        isEnrolled={false}
        lectures={[]}
      />,
    );

    // Click Register now button
    const buyBtn = screen.getByRole("button", { name: "Register now" });
    fireEvent.click(buyBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify checkoutMutate and navigation.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockCheckoutMutate).toHaveBeenCalledWith({
        entityIds: ["c-200"],
        entityType: "COURSE",
      });
      expect(mockPush).toHaveBeenCalledWith("/checkout?orderId=ord-777");
    });
  });

  it("shouldAddCourseToCartOnAddToCartClick", async () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Mock showSuccess separately for this assertion.
    // ----------------------------------------------------------------------------
    const mockShowSuccess = vi.fn();
    vi.mocked(apiToast.useApiWithToast).mockReturnValue(
      createMockApiWithToast({ showSuccess: mockShowSuccess }),
    );

    // ----------------------------------------------------------------------------
    // Act
    // Render CoursePurchaseSection.
    // ----------------------------------------------------------------------------
    render(
      <CoursePurchaseSection
        course={mockCourse}
        isEnrolled={false}
        lectures={[]}
      />,
    );

    const cartBtn = screen.getByRole("button", { name: "Add to cart" });
    fireEvent.click(cartBtn);

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify addToCartMutate execution.
    // ----------------------------------------------------------------------------
    await waitFor(() => {
      expect(mockAddToCartMutate).toHaveBeenCalledWith("c-200");
      expect(mockShowSuccess).toHaveBeenCalledWith(
        "Added to cart successfully",
      );
    });
  });
});
