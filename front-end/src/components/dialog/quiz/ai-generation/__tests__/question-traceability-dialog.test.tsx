import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuestionTraceabilityDialog } from "../question-traceability-dialog";
import * as quizApi from "@/lib/api/quizzes";
import type { QuestionTraceabilityResponse } from "@/lib/type/quizzes";
import { createMockQueryResult } from "@/testing/mock-query";

vi.mock("@/lib/api/quizzes", () => ({
  useQuestionTraceabilityQuery: vi.fn(),
}));

describe("QuestionTraceabilityDialog Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof QuestionTraceabilityDialog>> = {},
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <QuestionTraceabilityDialog
          open={true}
          onClose={vi.fn()}
          jobId="job-1"
          questionId="q-1"
          questionContent="What is concurrency in Java?"
          {...props}
        />
      </QueryClientProvider>,
    );
  };

  it("should render question content and traceability details", () => {
    const onClose = vi.fn();
    vi.mocked(quizApi.useQuestionTraceabilityQuery).mockReturnValue({
      data: {
        id: "tr-1",
        questionId: "q-1",
        generationJobId: "job-1",
        sectionName: "Chapter 4: Concurrency & Multithreading",
        pageNumber: 42,
        modelName: "gpt-4o",
        promptVersion: "v2.1",
        attemptCount: 1,
        validationMetrics: "Passed factuality check (0.95 score)",
      },
      isLoading: false,
      isError: false,
    } as never);
    const mockTraceability: QuestionTraceabilityResponse = {
      id: "tr-1",
      questionId: "q-1",
      generationJobId: "job-1",
      sectionName: "Chapter 4: Concurrency & Multithreading",
      pageNumber: 42,
      modelName: "gpt-4o",
      promptVersion: "v2.1",
      attemptCount: 1,
      validationMetrics: "Passed factuality check (0.95 score)",
      createdAt: "2026-08-01T00:00:00Z",
    };

    vi.mocked(quizApi.useQuestionTraceabilityQuery).mockReturnValue(
      createMockQueryResult(mockTraceability),
    );

    renderComponent({ onClose });

    expect(
      screen.getByText("Question Source & Traceability"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("What is concurrency in Java?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chapter 4: Concurrency & Multithreading"),
    ).toBeInTheDocument();
    expect(screen.getByText("Page 42")).toBeInTheDocument();
    expect(screen.getByText("gpt-4o")).toBeInTheDocument();
    expect(screen.getByText("v2.1")).toBeInTheDocument();
    expect(
      screen.getByText(/Passed factuality check \(0\.95 score\)/i),
    ).toBeInTheDocument();

    // Close button
    const closeBtn = screen.getByRole("button", { name: /Close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("should render fallback message when traceability is not available", () => {
    vi.mocked(quizApi.useQuestionTraceabilityQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(quizApi.useQuestionTraceabilityQuery).mockReturnValue(
      createMockQueryResult<QuestionTraceabilityResponse>(),
    );

    renderComponent();

    expect(
      screen.getByText(
        "Traceability information is not available for this question.",
      ),
    ).toBeInTheDocument();
  });
});