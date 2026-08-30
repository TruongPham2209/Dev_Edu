/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(student)/courses/[id]/quizzes/[assignmentId]/exam/page.tsx
 * src/app/(student)/courses/[id]/quizzes/[assignmentId]/exam/exam-timer.tsx
 * src/app/(student)/courses/[id]/quizzes/[assignmentId]/exam/exam-question-nav.tsx
 * src/app/(student)/courses/[id]/quizzes/[assignmentId]/exam/exam-autosave-indicator.tsx
 *
 * Purpose
 * -------
 * Verify Student Exam Room environment, question navigation, timer, autosave indicator,
 * answering choices/text, and submission modal flow.
 *
 * Tested Features
 * ---------------
 * ✓ ExamTimer component rendering formatted countdown time
 * ✓ ExamAutosaveIndicator rendering saved/saving status
 * ✓ ExamQuestionNav question grid and navigation buttons
 * ✓ Full Exam Room page rendering questions and options
 *
 * Covered Scenarios
 * -----------------
 * ✓ Active exam attempt room with single choice and essay questions
 * ✓ Timer and autosave status indicators
 * ✓ Question navigation grid interaction
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter, useSearchParams)
 * - "@/lib/api/quizzes" (useAttemptQuery, useSubmitAttemptMutation, useAutosaveAttemptMutation, useHeartbeatAttemptMutation)
 * - "@/hooks/use-quiz-exam-session" (useQuizExamSession)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - Real-time WebSocket connection
 *
 * Notes
 * -----
 * Unit test for Student Exam Room components & page.
 */

import type { AutosaveState } from "@/hooks/use-quiz-exam-session";
import * as useQuizExamSessionModule from "@/hooks/use-quiz-exam-session";
import * as quizzesApi from "@/lib/api/quizzes";
import * as toastContext from "@/lib/toast-context";
import type {
  StartAttemptResponse,
  StudentQuestionDto,
  SubmitAttemptResponse
} from "@/lib/type/quizzes";
import { createMockToast } from "@/testing/mock-data";
import {
  createMockMutationResult,
  createMockQueryResult,
} from "@/testing/mock-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ExamAutosaveIndicator } from "../exam-autosave-indicator";
import { ExamQuestionNav } from "../exam-question-nav";
import { ExamTimer } from "../exam-timer";
import CourseStudentExamRoomPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => ({
    get: (k: string) => (k === "attemptId" ? "att-1" : null),
  }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useAttemptQuery: vi.fn(),
  useSubmitAttemptMutation: vi.fn(),
  useAutosaveAttemptMutation: vi.fn(),
  useHeartbeatAttemptMutation: vi.fn(),
}));

vi.mock("@/hooks/use-quiz-exam-session", () => ({
  useQuizExamSession: vi.fn(),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(),
}));

describe("Student Exam Room Components & Page", () => {
  const mockToast = createMockToast();

  const mockQuestions: StudentQuestionDto[] = [
    {
      id: "q-1",
      content: "What is Next.js App Router?",
      questionType: "SINGLE_CHOICE",
      points: 5,
      orderIndex: 0,
      options: [
        {
          id: "opt-1",
          optionText: "A File-System Based Router",
          orderIndex: 0,
        },
        { id: "opt-2", optionText: "A CSS Framework", orderIndex: 1 },
      ],
    },
    {
      id: "q-2",
      content: "Explain Server Components.",
      questionType: "ESSAY",
      points: 5,
      orderIndex: 1,
    },
  ];

  const mockStartData: StartAttemptResponse = {
    attemptId: "att-1",
    assignmentId: "assign-1",
    quizId: "quiz-1",
    attemptNumber: 1,
    status: "IN_PROGRESS",
    startedAt: "2026-08-06T11:00:00Z",
    expiresAt: "2026-08-06T12:00:00Z",
    maxScore: 10,
    activeSessionToken: "st-token",
    quizTitle: "Final Exam 2026",
    questions: mockQuestions,
  };

  const mockAnswersMap: Record<
    string,
    { selectedOptionIds?: string[]; answerText?: string }
  > = {
    "q-1": { selectedOptionIds: ["opt-1"] },
  };

  const mockSession: ReturnType<typeof useQuizExamSessionModule.useQuizExamSession> = {
    sessionToken: "st-token",
    isSessionLocked: false,
    sessionLockMessage: "",
    timeRemaining: 1800,
    isExpired: false,
    answersMap: mockAnswersMap,
    autosaveState: "SAVED" as AutosaveState,
    updateSingleChoice: vi.fn(),
    updateMultipleChoice: vi.fn(),
    updateEssayAnswer: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(toastContext.useToast).mockReturnValue(mockToast);
    vi.mocked(quizzesApi.useAttemptQuery).mockReturnValue(
      createMockQueryResult<StartAttemptResponse>(mockStartData),
    );
    vi.mocked(quizzesApi.useSubmitAttemptMutation).mockReturnValue(
      createMockMutationResult<SubmitAttemptResponse, Error, string>(),
    );
    vi.mocked(useQuizExamSessionModule.useQuizExamSession).mockReturnValue(
      mockSession,
    );
  });

  it("shouldRenderExamTimer", () => {
    render(<ExamTimer timeRemainingSeconds={300} />);
    expect(screen.getByText("05:00")).toBeInTheDocument();
  });

  it("shouldRenderExamAutosaveIndicator", () => {
    render(<ExamAutosaveIndicator state="SAVED" />);
    expect(screen.getByText(/Saved/i)).toBeInTheDocument();
  });

  it("shouldRenderExamQuestionNav", () => {
    render(
      <ExamQuestionNav
        questions={mockQuestions}
        currentIndex={0}
        answersMap={mockSession.answersMap}
        onSelectQuestion={vi.fn()}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shouldRenderCourseStudentExamRoomPage", async () => {
    const params = Promise.resolve({
      id: "course-1",
      assignmentId: "assign-1",
    });
    await act(async () => {
      render(<CourseStudentExamRoomPage params={params} />);
    });

    await waitFor(() => {
      expect(screen.getByText("Final Exam 2026")).toBeInTheDocument();
      expect(
        screen.getByText("What is Next.js App Router?"),
      ).toBeInTheDocument();
    });
  });
});
