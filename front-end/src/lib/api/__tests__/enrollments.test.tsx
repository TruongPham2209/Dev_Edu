/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/lib/api/enrollments.ts
 *
 * Purpose
 * -------
 * Verify that enrollments API helpers and React Query hooks construct request endpoints correctly.
 *
 * Tested Features
 * ---------------
 * ✓ getCartItems API call (/api/v1/cart/items/courses)
 * ✓ addToCart and removeFromCart API calls
 * ✓ checkout API call (/api/v1/orders/checkout)
 * ✓ getOrderDetail and useOrderDetailQuery hook
 *
 * Covered Scenarios
 * -----------------
 * ✓ Cart item management
 * ✓ Order checkout creation
 * ✓ Querying order details
 *
 * Mocked Dependencies
 * -------------------
 * - "@/lib/api/client" (apiGet, apiPost, apiDelete)
 *
 * Not Covered
 * -----------
 * - Real backend payment gateway integration
 *
 * Notes
 * -----
 * Unit test for enrollments API endpoints.
 */

import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  getCartItems,
  addToCart,
  removeFromCart,
  checkout,
  useOrderDetailQuery,
} from "../enrollments";
import * as client from "../client";

vi.mock("../client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiDelete: vi.fn(),
}));

describe("Enrollments API", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it("shouldCallApiGetForCartItems", async () => {
    const mockCart = { contents: [{ courseId: "c-1" }], totalElements: 1 };
    vi.mocked(client.apiGet).mockResolvedValue(mockCart);

    const result = await getCartItems();

    expect(client.apiGet).toHaveBeenCalledWith("/api/v1/cart/items/courses");
    expect(result).toEqual(mockCart);
  });

  it("shouldCallApiPostForAddToCart", async () => {
    vi.mocked(client.apiPost).mockResolvedValue(undefined);

    await addToCart("course-55");

    expect(client.apiPost).toHaveBeenCalledWith("/api/v1/cart/items/courses", {
      courseId: "course-55",
    });
  });

  it("shouldCallApiDeleteForRemoveFromCart", async () => {
    vi.mocked(client.apiDelete).mockResolvedValue(undefined);

    await removeFromCart("course-55");

    expect(client.apiDelete).toHaveBeenCalledWith(
      "/api/v1/cart/items/courses?courseId=course-55",
    );
  });

  it("shouldCallApiPostForCheckout", async () => {
    const mockCheckoutRes = { orderId: "ord-99", totalAmount: 500000 };
    vi.mocked(client.apiPost).mockResolvedValue(mockCheckoutRes);

    const result = await checkout({
      entityIds: ["c-1"],
      entityType: "COURSE" as any,
    });

    expect(client.apiPost).toHaveBeenCalledWith("/api/v1/orders/checkout", {
      entityIds: ["c-1"],
      entityType: "COURSE",
    });
    expect(result).toEqual(mockCheckoutRes);
  });

  it("shouldExecuteUseOrderDetailQueryHook", async () => {
    const mockOrder = { orderId: "ord-99", totalAmount: 500000 };
    vi.mocked(client.apiGet).mockResolvedValue(mockOrder);

    const { result } = renderHook(() => useOrderDetailQuery("ord-99"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockOrder);
  });
});
