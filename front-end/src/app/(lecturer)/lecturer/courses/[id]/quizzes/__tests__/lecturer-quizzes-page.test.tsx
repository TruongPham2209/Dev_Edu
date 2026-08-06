/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/app/(lecturer)/lecturer/courses/[id]/quizzes/page.tsx
 * src/app/(lecturer)/lecturer/courses/[id]/quizzes/quiz-hero.tsx
 *
 * Purpose
 * -------
 * Verify lecturer create quiz page rendering and quiz hero breadcrumb header.
 *
 * Tested Features
 * ---------------
 * ✓ QuizHero component rendering course breadcrumbs and quiz title
 * ✓ LecturerCreateQuizPage rendering step 1 general quiz info form
 *
 * Covered Scenarios
 * -----------------
 * ✓ Quiz hero breadcrumb header rendering
 * ✓ Lecturer create quiz page initial step rendering
 *
 * Mocked Dependencies
 * -------------------
 * - "next/navigation" (useRouter)
 * - "@/lib/api/courses" (useCourseByIdQuery)
 * - "@/lib/api/quizzes" (useCreateQuizMutation, useUpdateQuizMutation, useQuizTypeConfigsQuery)
 * - "@/lib/toast-context" (useToast)
 *
 * Not Covered
 * -----------
 * - Direct navigation route changes
 *
 * Notes
 * -----
 * Unit test for Lecturer Quizzes Page & QuizHero.
 */

import * as coursesApi from "@/lib/api/courses";
import * as quizzesApi from "@/lib/api/quizzes";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LecturerCreateQuizPage from "../page";
import { QuizHero } from "../quiz-hero";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/api/quizzes", () => ({
  useCreateQuizMutation: vi.fn(),
  useUpdateQuizMutation: vi.fn(),
  useCreateQuizTypeConfigMutation: vi.fn(),
  useDeleteQuizTypeConfigMutation: vi.fn(),
  useQuizTypeConfigsQuery: vi.fn(),
}));

vi.mock("@/lib/api/courses", () => ({
  useCourseByIdQuery: vi.fn(),
}));

vi.mock("@/lib/toast-context", () => ({
  useToast: vi.fn(() => ({ success: vi.fn(), error: vi.fn() })),
}));

describe("Lecturer Quizzes Page & QuizHero", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(coursesApi.useCourseByIdQuery).mockReturnValue({
      data: { id: "course-123", title: "Advanced React & Next.js" },
      isLoading: false,
    } as any);

    vi.mocked(quizzesApi.useCreateQuizMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(quizzesApi.useQuizTypeConfigsQuery).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
  });

  it("shouldRenderQuizHeroTitleAndDescription", () => {
    render(<QuizHero courseId="course-123" quizTitle="Midterm Quiz" />);

    expect(screen.getByText("Advanced React & Next.js")).toBeInTheDocument();
    expect(screen.getByText("Midterm Quiz")).toBeInTheDocument();
  });

  it("shouldRenderLecturerCreateQuizPage", async () => {
    const params = Promise.resolve({ id: "course-123" });
    render(<LecturerCreateQuizPage params={params} />);

    expect(
      screen.getByText("1. General Quiz Information"),
    ).toBeInTheDocument();
  });
});
