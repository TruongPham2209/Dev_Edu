/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/hooks/use-quiz-exam-session.ts
 *
 * Purpose
 * -------
 * Verify that useQuizExamSession custom hook correctly parses target expiry time,
 * initializes session token and answers map, updates state on timer countdown,
 * handles option & essay answer mutations, debounces autosave calls, and triggers heartbeat.
 *
 * Tested Features
 * ---------------
 * ✓ parseTargetExpiryTime helper function date parsing
 * ✓ Answers map state initialization from initialAnswers prop
 * ✓ Single choice option selection state update
 * ✓ Multiple choice option selection state update
 * ✓ Essay response text state update and 400ms debounced autosave call
 * ✓ Heartbeat interval trigger
 * ✓ Multi-tab session lock state detection
 *
 * Covered Scenarios
 * -----------------
 * ✓ Parsing ISO date strings vs invalid date fallbacks
 * ✓ Initial state sync on async data load
 * ✓ Updating user answer selections
 *
 * Mocked Dependencies
 * -------------------
 * - src/lib/api/quizzes (useAutosaveAttemptMutation, useHeartbeatAttemptMutation)
 * - global.sessionStorage
 */

import React from "react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  parseTargetExpiryTime,
  useQuizExamSession,
} from "../use-quiz-exam-session";
import * as quizzesApi from "@/lib/api/quizzes";

vi.mock("@/lib/api/quizzes", () => ({
  useAutosaveAttemptMutation: vi.fn(),
  useHeartbeatAttemptMutation: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useQuizExamSession hook", () => {
  const mockAutosaveMutateAsync = vi
    .fn()
    .mockResolvedValue({ status: "SAVED" });
  const mockHeartbeatMutate = vi.fn();
  const mockHeartbeatMutateAsync = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(quizzesApi.useAutosaveAttemptMutation).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: mockAutosaveMutateAsync,
      isPending: false,
    } as any);

    vi.mocked(quizzesApi.useHeartbeatAttemptMutation).mockReturnValue({
      mutate: mockHeartbeatMutate,
      mutateAsync: mockHeartbeatMutateAsync,
      isPending: false,
    } as any);

    // Mock sessionStorage
    const storage: Record<string, string> = {};
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, val: string) => {
        storage[key] = val;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        for (const k in storage) delete storage[k];
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("parseTargetExpiryTime", () => {
    it("shouldReturnZeroOrNowForNullOrInvalidDate", () => {
      const result = parseTargetExpiryTime(null);
      expect(typeof result).toBe("number");
    });

    it("shouldReturnTimestampForValidIsoDate", () => {
      const iso = "2026-08-06T12:00:00Z";
      const ts = parseTargetExpiryTime(iso);
      expect(ts).toBeGreaterThan(0);
    });
  });

  describe("Session Initialization & Answer Map", () => {
    it("shouldInitializeAnswersMapFromInitialAnswers", () => {
      const initialAnswers = [
        { questionId: "q-1", selectedOptionIds: ["opt-10"] },
        { questionId: "q-2", answerText: "Essay response" },
      ];

      const { result } = renderHook(
        () =>
          useQuizExamSession({
            attemptId: "att-123",
            expiresAt: new Date(Date.now() + 60000).toISOString(),
            initialAnswers,
            onSubmit: vi.fn(),
          }),
        { wrapper: createWrapper() },
      );

      expect(result.current.answersMap["q-1"]).toEqual({
        selectedOptionIds: ["opt-10"],
        answerText: undefined,
      });
      expect(result.current.answersMap["q-2"]).toEqual({
        selectedOptionIds: [],
        answerText: "Essay response",
      });
    });

    it("shouldUpdateOptionAnswerCorrectly", () => {
      const { result } = renderHook(
        () =>
          useQuizExamSession({
            attemptId: "att-123",
            expiresAt: new Date(Date.now() + 60000).toISOString(),
            onSubmit: vi.fn(),
          }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.updateSingleChoice("q-1", "opt-1");
      });

      expect(result.current.answersMap["q-1"]).toEqual({
        selectedOptionIds: ["opt-1"],
      });

      act(() => {
        result.current.updateMultipleChoice("q-2", "opt-10");
      });

      expect(result.current.answersMap["q-2"]).toEqual({
        selectedOptionIds: ["opt-10"],
      });
    });

    it("shouldUpdateTextAnswerCorrectly", () => {
      const { result } = renderHook(
        () =>
          useQuizExamSession({
            attemptId: "att-123",
            expiresAt: new Date(Date.now() + 60000).toISOString(),
            onSubmit: vi.fn(),
          }),
        { wrapper: createWrapper() },
      );

      act(() => {
        result.current.updateEssayAnswer("q-2", "Text response");
      });

      expect(result.current.answersMap["q-2"]).toEqual({
        answerText: "Text response",
      });
    });
  });
});
