import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

if (typeof window !== "undefined") {
  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    };
  }

  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
      readonly root: Element | Document | null = null;
      readonly rootMargin = "";
      readonly scrollMargin = "";
      readonly thresholds: ReadonlyArray<number> = [];

      constructor(
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
      ) {
        void callback;
        void options;
      }

      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    };
  }
}