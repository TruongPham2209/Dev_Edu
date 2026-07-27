/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/hooks/use-debounce.ts
 *
 * Purpose
 * -------
 * Verify that the useDebounce custom hook delays updating the output value
 * until the specified delay period has elapsed without new value changes,
 * and correctly cancels previous timers on rapid updates.
 *
 * Tested Features
 * ---------------
 * ✓ Initial value returning without delay
 * ✓ Delayed value updates after specified timeout (default 500ms and custom delay)
 * ✓ Debounce timer reset and cancellation on rapid value updates
 * ✓ Unmount timer cleanup
 *
 * Covered Scenarios
 * -----------------
 * ✓ Immediate initial render state
 * ✓ Value update prior to delay completion (timer reset)
 * ✓ Value update after delay completion
 * ✓ Default delay fallback (500ms)
 * ✓ Custom delay (e.g. 300ms, 1000ms)
 * ✓ Hook unmount cleanup
 *
 * Mocked Dependencies
 * -------------------
 * - None (Uses Vitest fake timers and RTL renderHook)
 *
 * Not Covered
 * -----------
 * - Real wall-clock timing delays
 *
 * Notes
 * -----
 * Unit test for React custom hook leveraging Vitest fake timers.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../use-debounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("shouldReturnInitialValueImmediatelyOnFirstRender", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Prepare props and render hook.
    // ----------------------------------------------------------------------------
    const { result } = renderHook(() => useDebounce("initial", 500));

    // ----------------------------------------------------------------------------
    // Assert
    // Verify returned result.
    // ----------------------------------------------------------------------------
    expect(result.current).toBe("initial");
  });

  it("shouldNotUpdateValueBeforeDelayHasElapsed", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render hook with initial value.
    // ----------------------------------------------------------------------------
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "first", delay: 500 } },
    );

    // ----------------------------------------------------------------------------
    // Act
    // Rerender with new value and advance timers partially.
    // ----------------------------------------------------------------------------
    rerender({ value: "second", delay: 500 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify value has not changed yet.
    // ----------------------------------------------------------------------------
    expect(result.current).toBe("first");
  });

  it("shouldUpdateValueAfterSpecifiedDelayHasElapsed", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render hook with initial value.
    // ----------------------------------------------------------------------------
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial-text", delay: 300 } },
    );

    // ----------------------------------------------------------------------------
    // Act
    // Rerender with new value and advance timers beyond delay.
    // ----------------------------------------------------------------------------
    rerender({ value: "updated-text", delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify value is updated after delay.
    // ----------------------------------------------------------------------------
    expect(result.current).toBe("updated-text");
  });

  it("shouldUseDefaultDelayOf500msWhenDelayParameterIsOmitted", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render hook without delay argument.
    // ----------------------------------------------------------------------------
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: "start" } },
    );

    // ----------------------------------------------------------------------------
    // Act
    // Change value and advance timers by 499ms and then 1ms.
    // ----------------------------------------------------------------------------
    rerender({ value: "end" });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe("start");

    act(() => {
      vi.advanceTimersByTime(1);
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Verify value updates at exactly 500ms.
    // ----------------------------------------------------------------------------
    expect(result.current).toBe("end");
  });

  it("shouldResetTimerWhenValueChangesRapidly", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render hook with initial value.
    // ----------------------------------------------------------------------------
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "val-1", delay: 500 } },
    );

    // ----------------------------------------------------------------------------
    // Act
    // Trigger rapid updates every 200ms.
    // ----------------------------------------------------------------------------
    rerender({ value: "val-2", delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    rerender({ value: "val-3", delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // ----------------------------------------------------------------------------
    // Assert
    // Value should still be val-1 because timer kept resetting.
    // ----------------------------------------------------------------------------
    expect(result.current).toBe("val-1");

    // Advance full 500ms from last update
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe("val-3");
  });

  it("shouldClearTimeoutOnUnmount", () => {
    // ----------------------------------------------------------------------------
    // Arrange
    // Render hook and trigger value change.
    // ----------------------------------------------------------------------------
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const { rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } },
    );

    rerender({ value: "changed", delay: 500 });

    // ----------------------------------------------------------------------------
    // Act
    // Unmount before timer finishes.
    // ----------------------------------------------------------------------------
    unmount();

    // ----------------------------------------------------------------------------
    // Assert & Verify
    // Verify clearTimeout was executed.
    // ----------------------------------------------------------------------------
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
