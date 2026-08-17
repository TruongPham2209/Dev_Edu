"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { QuestionFormDialog } from "@/components/dialog/quiz/question-form-dialog";
import { TypeConfigDialog } from "@/components/dialog/quiz/type-config-dialog";
import {
  useCreateQuizQuestionMutation,
  useCreateQuizTypeConfigMutation,
  useDeleteQuizQuestionMutation,
  useDeleteQuizTypeConfigMutation,
  useQuizByIdQuery,
  useQuizTypeConfigsQuery,
  useSubmitQuizMutation,
  useUpdateQuizMutation,
  useUpdateQuizQuestionMutation,
} from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import type {
  QuestionType,
  QuizQuestionRequest,
  QuizQuestionResponse,
  QuizResponse,
  QuizStatus,
  QuizTypeConfigRequest,
  QuizTypeConfigResponse,
} from "@/lib/type/quizzes";
import { validateQuizForSubmit } from "@/lib/util/quiz-utils";
import { Alert, Box, Container, Grid, Stack } from "@mui/material";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { ConfigureQuizSkeleton } from "./configure-quiz-skeleton";
import { ProgressSummaryCard } from "./progress-summary-card";
import { QuestionsSection } from "./questions-section";
import { QuizHero } from "../quiz-hero";
import { QuizInfoSection } from "./quiz-info-section";
import { TypeConfigsSection } from "./type-configs-section";

export default function LecturerQuizConfigurePage({
  params,
}: {
  params: Promise<{ id: string; quizId: string }>;
}) {
  const { id: courseId, quizId } = use(params);
  const router = useRouter();
  const toast = useToast();

  // Local Form state
  const [overrideStatus, setOverrideStatus] = useState<QuizStatus | null>(null);

  // Type Config dialog state
  const [openTypeConfigModal, setOpenTypeConfigModal] = useState(false);
  const [editingTypeConfig, setEditingTypeConfig] =
    useState<QuizTypeConfigResponse | null>(null);

  // Question dialog state
  const [openQuestionModal, setOpenQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<QuizQuestionResponse | null>(null);
  const [defaultQuestionType, setDefaultQuestionType] =
    useState<QuestionType>("SINGLE_CHOICE");
  const [isDuplicateQuestion, setIsDuplicateQuestion] = useState(false);

  // Confirm Dialog states
  const [deletingTypeConfig, setDeletingTypeConfig] =
    useState<QuizTypeConfigResponse | null>(null);
  const [deletingQuestion, setDeletingQuestion] =
    useState<QuizQuestionResponse | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // 1. Fetch Quiz Details
  const {
    data: fetchedQuizDetail,
    isLoading: isLoadingQuiz,
    isError: isErrorQuiz,
    refetch: refetchQuiz,
  } = useQuizByIdQuery(quizId, {
    enabled: !!quizId,
  });

  // 2. Fetch Type Configs
  const {
    data: fetchedTypeConfigs = [],
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useQuizTypeConfigsQuery(quizId, {
    enabled: !!quizId,
  });

  // Normalize quizDetail
  const realQuiz = fetchedQuizDetail?.quiz;
  const questions: QuizQuestionResponse[] = fetchedQuizDetail?.questions || [];

  const typeConfigs: QuizTypeConfigResponse[] =
    fetchedTypeConfigs.length > 0
      ? fetchedTypeConfigs
      : fetchedQuizDetail?.typeConfigs || [];

  const quizDetail: QuizResponse | null = realQuiz
    ? {
        ...realQuiz,
        status: overrideStatus || realQuiz.status || "DRAFT",
        typeConfigs,
        questions,
      }
    : null;

  const isPendingStatus = quizDetail?.status === "PENDING";
  const quizTitle = quizDetail?.title || "";

  // Reusable Helper for content modifications -> Automatically reset Quiz status to DRAFT
  const handleContentModified = (successMsg: string) => {
    setOverrideStatus("DRAFT");
    toast.success(successMsg);
    toast.info("Quiz status reset to DRAFT due to content modifications.");
    refetchQuiz();
    refetchConfigs();
  };

  // Mutations
  const updateQuizMutation = useUpdateQuizMutation({
    onSuccess: () => {
      handleContentModified("Updated quiz info successfully!");
    },
    onError: (err) => {
      toast.error(`Update failed: ${err.message}`);
    },
  });

  const createTypeConfigMutation = useCreateQuizTypeConfigMutation({
    onSuccess: () => {
      setOpenTypeConfigModal(false);
      setEditingTypeConfig(null);
      handleContentModified("Added matrix type config!");
    },
    onError: (err) => {
      toast.error(`Failed to add matrix config: ${err.message}`);
    },
  });

  const deleteTypeConfigMutation = useDeleteQuizTypeConfigMutation({
    onSuccess: () => {
      setDeletingTypeConfig(null);
      handleContentModified("Deleted matrix config successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to delete matrix config: ${err.message}`);
    },
  });

  const createQuestionMutation = useCreateQuizQuestionMutation({
    onSuccess: () => {
      setOpenQuestionModal(false);
      setEditingQuestion(null);
      setIsDuplicateQuestion(false);
      handleContentModified(
        isDuplicateQuestion
          ? "Duplicated question successfully!"
          : "Added question successfully!",
      );
    },
    onError: (err) => {
      toast.error(`Failed to save question: ${err.message}`);
    },
  });

  const updateQuestionMutation = useUpdateQuizQuestionMutation({
    onSuccess: () => {
      setOpenQuestionModal(false);
      setEditingQuestion(null);
      setIsDuplicateQuestion(false);
      handleContentModified("Updated question successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to update question: ${err.message}`);
    },
  });

  const deleteQuestionMutation = useDeleteQuizQuestionMutation({
    onSuccess: () => {
      setDeletingQuestion(null);
      handleContentModified("Deleted question successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to delete question: ${err.message}`);
    },
  });

  const submitQuizMutation = useSubmitQuizMutation({
    onSuccess: () => {
      toast.success("Submitted quiz for approval successfully!");
      setShowSubmitConfirm(false);
      router.push(`/lecturer/courses/${courseId}`);
    },
    onError: (err) => {
      toast.error(`Submission failed: ${err.message}`);
    },
  });

  // Calculate real-time question count progress per type config
  const typeConfigProgress = useMemo(() => {
    return typeConfigs.map((cfg) => {
      const actualCount = questions.filter(
        (q) => q.questionType === cfg.questionType,
      ).length;
      const isComplete = actualCount === cfg.requiredCount;
      return {
        ...cfg,
        actualCount,
        isComplete,
      };
    });
  }, [typeConfigs, questions]);

  const totalRequiredQuestions = useMemo(() => {
    return typeConfigs.reduce((acc, cfg) => acc + cfg.requiredCount, 0);
  }, [typeConfigs]);

  const isAllConfigComplete = useMemo(() => {
    if (typeConfigs.length === 0) return false;
    return typeConfigProgress.every((p) => p.isComplete);
  }, [typeConfigs, typeConfigProgress]);

  // Handlers
  const handleSaveQuizInfo = async (
    newTitle: string,
    newDescription: string,
  ) => {
    if (isPendingStatus) {
      toast.error(
        "Quiz Information cannot be updated when Quiz is pending approval.",
      );
      return;
    }

    await updateQuizMutation.mutateAsync({
      quizId,
      data: {
        courseId,
        title: newTitle,
        description: newDescription,
      },
    });
  };

  const handleSaveTypeConfig = async (data: QuizTypeConfigRequest) => {
    if (isPendingStatus) {
      toast.error(
        "Type Configs cannot be modified when Quiz is pending approval.",
      );
      return;
    }

    await createTypeConfigMutation.mutateAsync({
      quizId,
      config: data,
    });
  };

  const handleDeleteTypeConfigClick = (cfg: QuizTypeConfigResponse) => {
    if (isPendingStatus) {
      toast.error(
        "Type Configs cannot be deleted when Quiz is pending approval.",
      );
      return;
    }

    const assignedQuestions = questions.filter(
      (q) => q.questionType === cfg.questionType,
    );

    if (assignedQuestions.length > 0) {
      toast.error(
        `Cannot delete "${cfg.questionType}" matrix config! Please delete all ${assignedQuestions.length} questions belonging to this type config first.`,
      );
      return;
    }

    setDeletingTypeConfig(cfg);
  };

  const handleConfirmDeleteTypeConfig = async () => {
    if (!deletingTypeConfig) return;
    await deleteTypeConfigMutation.mutateAsync({
      quizId,
      configId: deletingTypeConfig.id,
    });
  };

  // Question Form Handlers
  const handleOpenAddQuestion = (type: QuestionType) => {
    if (isPendingStatus) {
      toast.error("Questions cannot be added when Quiz is pending approval.");
      return;
    }
    setEditingQuestion(null);
    setDefaultQuestionType(type);
    setIsDuplicateQuestion(false);
    setOpenQuestionModal(true);
  };

  const handleOpenEditQuestion = (q: QuizQuestionResponse) => {
    if (isPendingStatus) {
      toast.error("Questions cannot be edited when Quiz is pending approval.");
      return;
    }
    setEditingQuestion(q);
    setDefaultQuestionType(q.questionType);
    setIsDuplicateQuestion(false);
    setOpenQuestionModal(true);
  };

  const handleOpenDuplicateQuestion = (q: QuizQuestionResponse) => {
    if (isPendingStatus) {
      toast.error(
        "Questions cannot be duplicated when Quiz is pending approval.",
      );
      return;
    }
    setEditingQuestion(q);
    setDefaultQuestionType(q.questionType);
    setIsDuplicateQuestion(true);
    setOpenQuestionModal(true);
  };

  const handleSaveQuestion = async (data: QuizQuestionRequest) => {
    if (isPendingStatus) {
      toast.error(
        "Questions cannot be modified when Quiz is pending approval.",
      );
      return;
    }

    if (editingQuestion && !isDuplicateQuestion) {
      await updateQuestionMutation.mutateAsync({
        quizId,
        questionId: editingQuestion.id,
        question: data,
      });
    } else {
      await createQuestionMutation.mutateAsync({
        quizId,
        question: data,
      });
    }
  };

  const handleConfirmDeleteQuestion = async () => {
    if (!deletingQuestion) return;
    if (isPendingStatus) {
      toast.error("Questions cannot be deleted when Quiz is pending approval.");
      return;
    }
    await deleteQuestionMutation.mutateAsync({
      quizId,
      questionId: deletingQuestion.id,
    });
  };

  // Submit Quiz Validation & Handler
  const handleSubmitQuizClick = () => {
    setShowSubmitConfirm(true);
  };

  const handleConfirmSubmitQuiz = async () => {
    if (!quizDetail) return;

    // Validate using quiz-utils
    const validation = validateQuizForSubmit(quizDetail);
    if (!validation.isValid) {
      toast.error(validation.errorMessage || "Quiz configuration is invalid!");
      return;
    }

    await submitQuizMutation.mutateAsync(quizId);
  };

  const isLoading = isLoadingQuiz || isLoadingConfigs;

  if (isErrorQuiz) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <ErrorState
          title="Failed to load quiz details"
          subtitle="An error occurred while retrieving quiz configurations."
          onRetry={() => {
            refetchQuiz();
            refetchConfigs();
          }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={{ xs: 2.5, sm: 4 }}>
        {/* 1. Hero Section */}
        <QuizHero
          courseId={courseId}
          quizTitle={quizDetail?.title || "Loading..."}
        />

        {/* Status Notice Banner when Pending */}
        {isPendingStatus && (
          <Alert
            severity="info"
            icon={<Lock size={18} />}
            sx={{ borderRadius: 1, fontWeight: 600 }}
          >
            This quiz is currently <strong>PENDING APPROVAL</strong>. Quiz
            Information, Type Configs, and Questions cannot be added, edited, or
            deleted while pending approval.
          </Alert>
        )}

        {isLoading ? (
          <ConfigureQuizSkeleton />
        ) : (
          <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
            {/* Main Content Column */}
            <Grid size={{ xs: 12, lg: 8.5 }}>
              <Stack spacing={3}>
                {/* 2. Quiz Info Section */}
                <QuizInfoSection
                  quizTitle={quizTitle}
                  description={quizDetail?.description}
                  status={quizDetail?.status}
                  isPendingStatus={isPendingStatus}
                  isSaving={updateQuizMutation.isPending}
                  onSave={handleSaveQuizInfo}
                />

                {/* 3. Type Configs Section */}
                <TypeConfigsSection
                  typeConfigs={typeConfigs}
                  typeConfigProgress={typeConfigProgress}
                  isPendingStatus={isPendingStatus}
                  onAddConfig={() => {
                    setEditingTypeConfig(null);
                    setOpenTypeConfigModal(true);
                  }}
                  onDeleteConfig={handleDeleteTypeConfigClick}
                />

                {/* 4. Questions Section */}
                <QuestionsSection
                  typeConfigs={typeConfigs}
                  questions={questions}
                  totalRequiredQuestions={totalRequiredQuestions}
                  isPendingStatus={isPendingStatus}
                  onAddQuestion={handleOpenAddQuestion}
                  onEditQuestion={handleOpenEditQuestion}
                  onDuplicateQuestion={handleOpenDuplicateQuestion}
                  onDeleteQuestion={setDeletingQuestion}
                />
              </Stack>
            </Grid>

            {/* ALWAYS STICKY TOP Summary & Action Sidebar Column */}
            <Grid
              size={{ xs: 12, lg: 3.5 }}
              sx={{
                position: { xs: "static", lg: "sticky" },
                top: { xs: "auto", lg: 96 },
                alignSelf: "flex-start",
                zIndex: 10,
              }}
            >
              <ProgressSummaryCard
                typeConfigProgress={typeConfigProgress}
                quizDetail={quizDetail}
                isAllConfigComplete={isAllConfigComplete}
                isSubmitting={submitQuizMutation.isPending}
                onSubmitClick={handleSubmitQuizClick}
              />
            </Grid>
          </Grid>
        )}
      </Stack>

      {/* Add / Edit Type Config Dialog */}
      <TypeConfigDialog
        open={openTypeConfigModal}
        onClose={() => setOpenTypeConfigModal(false)}
        onSave={handleSaveTypeConfig}
        initialData={editingTypeConfig}
        existingTypes={typeConfigs.map((c) => c.questionType)}
        loading={createTypeConfigMutation.isPending}
      />

      {/* Add / Edit / Duplicate Question Dialog */}
      <QuestionFormDialog
        open={openQuestionModal}
        onClose={() => setOpenQuestionModal(false)}
        onSave={handleSaveQuestion}
        initialData={editingQuestion}
        availableTypeConfigs={typeConfigs}
        defaultType={defaultQuestionType}
        isDuplicate={isDuplicateQuestion}
        loading={
          createQuestionMutation.isPending || updateQuestionMutation.isPending
        }
      />

      {/* Delete Type Config Confirm Dialog */}
      <ConfirmDialog
        open={!!deletingTypeConfig}
        title={`Delete Matrix Config "${deletingTypeConfig?.questionType}"`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        isLoading={deleteTypeConfigMutation.isPending}
        onCancel={() => setDeletingTypeConfig(null)}
        onConfirm={handleConfirmDeleteTypeConfig}
        description={
          deletingTypeConfig && (
            <Box component="span" sx={{ color: "text.secondary" }}>
              Are you sure you want to delete the matrix config for{" "}
              <Box
                component="span"
                sx={{ fontWeight: 700, color: "error.main" }}
              >
                &quot;{deletingTypeConfig.questionType}&quot;
              </Box>
              ?
            </Box>
          )
        }
      />

      {/* Delete Question Confirm Dialog */}
      <ConfirmDialog
        open={!!deletingQuestion}
        title="Delete Question"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        isLoading={deleteQuestionMutation.isPending}
        onCancel={() => setDeletingQuestion(null)}
        onConfirm={handleConfirmDeleteQuestion}
        description={
          deletingQuestion && (
            <Box component="span" sx={{ color: "text.secondary" }}>
              Are you sure you want to delete this question?
            </Box>
          )
        }
      />

      {/* Submit Quiz Confirm Dialog */}
      <ConfirmDialog
        open={showSubmitConfirm}
        title={`Submit Quiz "${quizTitle}"`}
        confirmLabel="Submit"
        cancelLabel="Cancel"
        confirmColor="warning"
        isLoading={submitQuizMutation.isPending}
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirm={handleConfirmSubmitQuiz}
        description={
          <Box component="span" sx={{ color: "text.secondary" }}>
            Are you sure you want to submit the quiz{" "}
            <Box
              component="span"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              &quot;{quizTitle}&quot;
            </Box>{" "}
            for approval? After submission, you will not be able to edit the
            quiz until you receive a response.
          </Box>
        }
      />
    </Container>
  );
}
