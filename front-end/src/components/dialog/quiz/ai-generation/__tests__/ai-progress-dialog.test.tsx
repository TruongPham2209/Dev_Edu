import * as quizApi from "@/lib/api/quizzes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { AiProgressDialog } from "../ai-progress-dialog";

vi.mock("@/lib/api/quizzes", () => ({
  useQuizGenerationJobQuery: vi.fn(),
}));

describe("AiProgressDialog Component", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof AiProgressDialog>> = {},
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AiProgressDialog
          open={true}
          onClose={vi.fn()}
          jobId="job-1"
          onSuccess={vi.fn()}
          {...props}
        />
      </QueryClientProvider>,
    );
  };

  it("should render processing state with live progress bar and counters", () => {
    vi.mocked(quizApi.useQuizGenerationJobQuery).mockReturnValue({
      data: {
        jobId: "job-1",
        courseId: "c-1",
        status: "DOCUMENT_PROCESSING",
        currentStep: "DOCUMENT_PROCESSING",
        requestedTotal: 10,
        processedCount: 2,
        acceptedCount: 2,
        rejectedCount: 0,
      },
      isLoading: false,
    } as any);

    renderComponent();

    expect(
      screen.getByText("AI Generation Pipeline in Progress"),
    ).toBeInTheDocument();
    expect(screen.getByText("Document Processing")).toBeInTheDocument();
    expect(screen.getByText("Live Polling")).toBeInTheDocument();
    expect(screen.getByText("Requested Total")).toBeInTheDocument();
    expect(screen.getByText("Accepted")).toBeInTheDocument();
  });

  it("should render completed state and trigger onSuccess when Done button is clicked", () => {
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const mockCompletedJob = {
      jobId: "job-1",
      courseId: "c-1",
      status: "COMPLETED",
      currentStep: "FINISHED",
      requestedTotal: 10,
      processedCount: 10,
      acceptedCount: 10,
      rejectedCount: 0,
    };

    vi.mocked(quizApi.useQuizGenerationJobQuery).mockReturnValue({
      data: mockCompletedJob,
      isLoading: false,
    } as any);

    renderComponent({ onSuccess, onClose });

    expect(
      screen.getByText("Generation Completed Successfully"),
    ).toBeInTheDocument();
    expect(screen.getByText("100% Completed")).toBeInTheDocument();

    const doneBtn = screen.getByRole("button", {
      name: /Done & View Questions/i,
    });
    expect(doneBtn).toBeInTheDocument();

    fireEvent.click(doneBtn);
    expect(onSuccess).toHaveBeenCalledWith(mockCompletedJob);
    expect(onClose).toHaveBeenCalled();
  });

  it("should render partial completion warning with partial question count", () => {
    vi.mocked(quizApi.useQuizGenerationJobQuery).mockReturnValue({
      data: {
        jobId: "job-1",
        courseId: "c-1",
        status: "PARTIAL",
        currentStep: "FINISHED",
        requestedTotal: 10,
        processedCount: 7,
        acceptedCount: 7,
        rejectedCount: 3,
      },
      isLoading: false,
    } as any);

    renderComponent();

    expect(
      screen.getByText("Generation Completed (Partial)"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("7/10 Questions Generated"),
    ).toBeInTheDocument();
  });

  it("should render irrelevant document business error", () => {
    vi.mocked(quizApi.useQuizGenerationJobQuery).mockReturnValue({
      data: {
        jobId: "job-1",
        courseId: "c-1",
        status: "IRRELEVANT_DOCUMENT",
        currentStep: "RELEVANCE_CHECKING",
        requestedTotal: 10,
        processedCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        errorMessage:
          "Uploaded PDF does not match the course syllabus topics.",
      },
      isLoading: false,
    } as any);

    renderComponent();

    expect(screen.getByText("Document Not Relevant")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Uploaded PDF does not match the course syllabus topics.",
      ),
    ).toBeInTheDocument();
  });

  it("should render insufficient source business error", () => {
    vi.mocked(quizApi.useQuizGenerationJobQuery).mockReturnValue({
      data: {
        jobId: "job-1",
        courseId: "c-1",
        status: "INSUFFICIENT_SOURCE",
        currentStep: "KNOWLEDGE_EVALUATING",
        requestedTotal: 10,
        processedCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
        errorMessage: "Document content is too brief to extract questions.",
      },
      isLoading: false,
    } as any);

    renderComponent();

    expect(
      screen.getByText("Insufficient Knowledge Source"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Document content is too brief to extract questions."),
    ).toBeInTheDocument();
  });
});