import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AiGeneratorDialog } from "../ai-generator-dialog";
import type {
  QuizTypeConfigResponse,
  QuizQuestionResponse,
} from "@/lib/type/quizzes";

vi.mock("@/lib/api/documents", () => ({
  useGlobalDocumentsInfiniteQuery: vi.fn(() => ({
    data: {
      pages: [
        {
          contents: [
            {
              id: "doc-1",
              title: "Java Core Textbook",
              fileName: "java_core.pdf",
              fileSize: 1024000,
              status: "READY",
              visibility: "GLOBAL",
            },
          ],
        },
      ],
    },
    isLoading: false,
    hasNextPage: false,
    fetchNextPage: vi.fn(),
    isFetchingNextPage: false,
  })),
}));

describe("AiGeneratorDialog Component", () => {
  let queryClient: QueryClient;

  const mockTypeConfigs: QuizTypeConfigResponse[] = [
    {
      id: "cfg-1",
      quizId: "q-1",
      questionType: "SINGLE_CHOICE",
      requiredCount: 5,
      pointsPerQuestion: 1,
      scoringMethod: "AUTO",
    },
  ];

  const mockExistingQuestions: QuizQuestionResponse[] = [
    {
      id: "quest-1",
      quizId: "q-1",
      questionType: "SINGLE_CHOICE",
      content: "Existing Question 1",
      points: 1,
      orderIndex: 0,
      options: [],
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (
    props: Partial<React.ComponentProps<typeof AiGeneratorDialog>> = {},
  ) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AiGeneratorDialog
          open={true}
          onClose={vi.fn()}
          onSubmitFromFile={vi.fn()}
          onSubmitFromDocument={vi.fn()}
          typeConfigs={mockTypeConfigs}
          existingQuestions={mockExistingQuestions}
          {...props}
        />
      </QueryClientProvider>,
    );
  };

  it("should render dialog title, tabs, and remaining slots breakdown", () => {
    renderComponent();

    expect(screen.getByText("AI Quiz Generation")).toBeInTheDocument();
    expect(
      screen.getByText(/Question Matrix Slots Remaining: 4/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Direct PDF Upload")).toBeInTheDocument();
    expect(screen.getByText("Global Document Library")).toBeInTheDocument();
  });

  it("should handle direct PDF upload flow with saveDocument option", async () => {
    const onSubmitFromFile = vi.fn().mockResolvedValue(undefined);
    renderComponent({ onSubmitFromFile });

    // 1. Select a PDF file
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const testPdf = new File(["dummy pdf content"], "operating_systems.pdf", {
      type: "application/pdf",
    });
    fireEvent.change(fileInput, { target: { files: [testPdf] } });

    expect(screen.getByText("operating_systems.pdf")).toBeInTheDocument();

    // 2. Toggle saveDocument checkbox
    const saveDocCheckbox = screen.getByRole("checkbox", {
      name: /Save document to Global Library/i,
    });
    expect(saveDocCheckbox).not.toBeChecked();
    fireEvent.click(saveDocCheckbox);
    expect(saveDocCheckbox).toBeChecked();

    // 3. Input custom prompt
    const promptInput = screen.getByLabelText(
      /AI Prompt & Generation Instructions/i,
    );
    fireEvent.change(promptInput, {
      target: {
        value: "Generate questions on Virtual Memory and Page Replacement Algorithms",
      },
    });

    // 4. Submit form
    const submitBtn = screen.getByRole("button", {
      name: /Generate 4 Questions with AI/i,
    });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmitFromFile).toHaveBeenCalledWith({
        file: testPdf,
        description:
          "Generate questions on Virtual Memory and Page Replacement Algorithms",
        saveDocument: true,
      });
    });
  });

  it("should validate non-PDF file selection", () => {
    renderComponent();

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const invalidFile = new File(["dummy text"], "notes.txt", {
      type: "text/plain",
    });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(
      screen.getByText(/Unsupported file format\. Allowed extensions: \.PDF\./i),
    ).toBeInTheDocument();
  });

  it("should handle Global Document Library tab selection and submission", async () => {
    const onSubmitFromDocument = vi.fn().mockResolvedValue(undefined);
    renderComponent({ onSubmitFromDocument });

    // Switch to Tab 2
    const libraryTab = screen.getByText("Global Document Library");
    fireEvent.click(libraryTab);

    // Verify document card is rendered
    expect(screen.getByText("Java Core Textbook")).toBeInTheDocument();

    // Click to select document card
    fireEvent.click(screen.getByText("Java Core Textbook"));

    // Enter prompt
    const promptInput = screen.getByLabelText(
      /AI Prompt & Generation Instructions/i,
    );
    fireEvent.change(promptInput, {
      target: { value: "Focus on Java Multithreading and Collections API" },
    });

    // Submit
    const submitBtn = screen.getByRole("button", {
      name: /Generate 4 Questions with AI/i,
    });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSubmitFromDocument).toHaveBeenCalledWith({
        documentId: "doc-1",
        description: "Focus on Java Multithreading and Collections API",
        saveDocument: false,
      });
    });
  });

  it("should disable submit button when matrix has 0 remaining slots", () => {
    // Fill all 5 slots
    const fullQuestions: QuizQuestionResponse[] = Array.from(
      { length: 5 },
      (_, i) => ({
        id: `q-${i}`,
        quizId: "q-1",
        questionType: "SINGLE_CHOICE" as const,
        content: `Question ${i}`,
        points: 1,
        orderIndex: i,
        options: [],
      }),
    );

    renderComponent({ existingQuestions: fullQuestions });

    expect(
      screen.getByText(/Question Matrix Slots Remaining: 0/i),
    ).toBeInTheDocument();

    const submitBtn = screen.getByRole("button", {
      name: /Generate 0 Questions with AI/i,
    });
    expect(submitBtn).toBeDisabled();
  });
});