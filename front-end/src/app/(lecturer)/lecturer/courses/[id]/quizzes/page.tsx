"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { TypeConfigDialog } from "@/components/dialog/quiz/type-config-dialog";
import {
  useCreateQuizMutation,
  useCreateQuizTypeConfigMutation,
  useDeleteQuizTypeConfigMutation,
  useQuizTypeConfigsQuery,
  useUpdateQuizMutation,
} from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import type {
  QuizTypeConfigRequest,
  QuizTypeConfigResponse,
} from "@/lib/type/quizzes";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowRight,
  CheckCircle2,
  Layers,
  Plus,
  Save,
  Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { QuizHero } from "./quiz-hero";

export default function LecturerCreateQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = use(params);
  const router = useRouter();
  const toast = useToast();

  // State
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [touchedInfo, setTouchedInfo] = useState(false);

  // Type config modal states
  const [openTypeConfigModal, setOpenTypeConfigModal] = useState(false);
  const [editingTypeConfig, setEditingTypeConfig] =
    useState<QuizTypeConfigResponse | null>(null);

  // Confirm dialog states
  const [deletingTypeConfig, setDeletingTypeConfig] =
    useState<QuizTypeConfigResponse | null>(null);
  const [showProceedConfirm, setShowProceedConfirm] = useState(false);

  // Mutations
  const createQuizMutation = useCreateQuizMutation({
    onSuccess: (data) => {
      setCreatedQuizId(data.id);
      toast.success(
        "Quiz created successfully! Now configure matrix question types.",
      );
    },
    onError: (err) => {
      toast.error(`Failed to create quiz: ${err.message}`);
    },
  });

  const updateQuizMutation = useUpdateQuizMutation({
    onSuccess: () => {
      toast.success("Quiz info updated successfully!");
    },
    onError: (err) => {
      toast.error(`Failed to update quiz: ${err.message}`);
    },
  });

  // Fetch Type Configs once Quiz is created
  const {
    data: typeConfigs = [],
    isLoading: isLoadingConfigs,
    refetch: refetchConfigs,
  } = useQuizTypeConfigsQuery(createdQuizId ?? "", {
    enabled: !!createdQuizId,
  });

  // Type Config mutations
  const createTypeConfigMutation = useCreateQuizTypeConfigMutation({
    onSuccess: () => {
      toast.success("Added question matrix config!");
      setOpenTypeConfigModal(false);
      setEditingTypeConfig(null);
      refetchConfigs();
    },
    onError: (err) => {
      toast.error(`Failed to add matrix config: ${err.message}`);
    },
  });

  const deleteTypeConfigMutation = useDeleteQuizTypeConfigMutation({
    onSuccess: () => {
      toast.success("Deleted matrix config successfully!");
      setDeletingTypeConfig(null);
      refetchConfigs();
    },
    onError: (err) => {
      toast.error(`Failed to delete matrix config: ${err.message}`);
    },
  });

  // Existing question types already added
  const existingTypes = useMemo(() => {
    return typeConfigs.map((c) => c.questionType);
  }, [typeConfigs]);

  // Handle Quiz Info Submit / Update
  const handleQuizInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouchedInfo(true);
    if (!quizTitle.trim()) {
      toast.error("Quiz title is required!");
      return;
    }

    if (createdQuizId) {
      await updateQuizMutation.mutateAsync({
        quizId: createdQuizId,
        data: {
          courseId,
          title: quizTitle.trim(),
          description: quizDescription.trim(),
        },
      });
    } else {
      await createQuizMutation.mutateAsync({
        courseId,
        title: quizTitle.trim(),
        description: quizDescription.trim(),
      });
    }
  };

  // Type Config Save
  const handleSaveTypeConfig = async (data: QuizTypeConfigRequest) => {
    if (!createdQuizId) return;

    await createTypeConfigMutation.mutateAsync({
      quizId: createdQuizId,
      config: data,
    });
  };

  // Delete Type Config confirm
  const handleConfirmDeleteTypeConfig = async () => {
    if (!createdQuizId || !deletingTypeConfig) return;

    await deleteTypeConfigMutation.mutateAsync({
      quizId: createdQuizId,
      configId: deletingTypeConfig.id,
    });
  };

  // Proceed to Questions Page confirm
  const handleConfirmProceed = () => {
    if (!createdQuizId) return;
    router.push(`/lecturer/courses/${courseId}/quizzes/${createdQuizId}`);
  };

  const isInfoSaving =
    createQuizMutation.isPending || updateQuizMutation.isPending;

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3, md: 4 } }}
    >
      <Stack spacing={{ xs: 2.5, sm: 4 }}>
        {/* 1. Hero Section */}
        <QuizHero courseId={courseId} />

        {/* 2. Quiz Info Section */}
        <Card variant="outlined" sx={{ borderRadius: 1 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                }}
              >
                1. General Quiz Information
              </Typography>
              {createdQuizId && (
                <Chip
                  icon={<CheckCircle2 size={14} />}
                  label="Quiz Created — Edit Mode"
                  color="success"
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            <form onSubmit={handleQuizInfoSubmit}>
              <Stack spacing={2.5}>
                <FormInput
                  label="Quiz Title *"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="E.g., Midterm Exam — Software Architecture"
                  error={touchedInfo && !quizTitle.trim()}
                  helperText={
                    touchedInfo && !quizTitle.trim()
                      ? "Quiz title cannot be empty"
                      : undefined
                  }
                />

                <FormInput
                  label="Description"
                  multiline
                  minRows={3}
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  placeholder="Enter instructions, syllabus topics covered, or notes for students..."
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isInfoSaving || !quizTitle.trim()}
                    startIcon={
                      createdQuizId ? <Save size={16} /> : <Plus size={16} />
                    }
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      fontWeight: 700,
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {isInfoSaving
                      ? "Saving..."
                      : createdQuizId
                        ? "Update Quiz Info"
                        : "Create Quiz & Continue"}
                  </Button>
                </Box>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {/* 3. Type Configs Section (Locked until Quiz is created) */}
        {createdQuizId ? (
          <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  mb: 2.5,
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.5,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.95rem", sm: "1.25rem" },
                    }}
                  >
                    2. Question Matrix Configurations
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                  >
                    Define question types, required counts, and points per
                    question.
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Plus size={16} />}
                  onClick={() => {
                    setEditingTypeConfig(null);
                    setOpenTypeConfigModal(true);
                  }}
                  disabled={existingTypes.length >= 3}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 700,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    width: { xs: "100%", sm: "auto" },
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    px: { xs: 2, sm: 2.5 },
                    py: 1,
                  }}
                >
                  Add Type Config
                </Button>
              </Box>

              {isLoadingConfigs ? (
                <Stack spacing={1.5}>
                  <Skeleton
                    variant="rounded"
                    height={60}
                    sx={{ borderRadius: 2 }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={60}
                    sx={{ borderRadius: 2 }}
                  />
                </Stack>
              ) : typeConfigs.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2.5, sm: 4 },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    borderRadius: 2.5,
                    bgcolor: "action.hover",
                    borderColor: "dashed",
                  }}
                >
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                      color: "#94a3b8",
                    }}
                  >
                    <Layers size={36} />
                  </Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.95rem", sm: "1rem" },
                    }}
                  >
                    No Matrix Type Configs Added Yet
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                  >
                    Add at least 1 question type config (Single Choice, Multiple
                    Choice, or Essay) to proceed to question creation.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Plus size={16} />}
                    onClick={() => {
                      setEditingTypeConfig(null);
                      setOpenTypeConfigModal(true);
                    }}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    Add First Type Config
                  </Button>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    {typeConfigs.map((cfg) => {
                      let typeLabel = cfg.questionType as string;
                      if (cfg.questionType === "SINGLE_CHOICE")
                        typeLabel = "Single Choice";
                      if (cfg.questionType === "MULTIPLE_CHOICE")
                        typeLabel = "Multiple Choice";
                      if (cfg.questionType === "ESSAY") typeLabel = "Essay";

                      return (
                        <Grid key={cfg.id} size={{ xs: 12, md: 6 }}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: { xs: 2, sm: 2.5 },
                              borderRadius: 2,
                              display: "flex",
                              flexDirection: "column",
                              gap: 1.5,
                              bgcolor: "white",
                              borderColor: "rgba(148, 163, 184, 0.16)",
                              transition: "all 0.2s",
                              "&:hover": {
                                borderColor: "primary.light",
                                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
                              },
                            }}
                          >
                            {/* Card Top Header: Type Label + Delete Action */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 800,
                                  color: "primary.main",
                                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                                }}
                              >
                                {typeLabel}
                              </Typography>

                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<Trash2 size={13} />}
                                onClick={() => setDeletingTypeConfig(cfg)}
                                sx={{
                                  borderRadius: 2,
                                  fontSize: { xs: "0.75rem", sm: "0.8rem" },
                                  px: 1.2,
                                  py: 0.4,
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                  flexShrink: 0,
                                }}
                              >
                                Delete
                              </Button>
                            </Box>

                            {/* Card Bottom Body: Question Count & Points + Grading Chip */}
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "flex-start", sm: "center" },
                                justifyContent: "space-between",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                }}
                              >
                                Required: <strong>{cfg.requiredCount}</strong>{" "}
                                questions &bull;{" "}
                                <strong>{cfg.pointsPerQuestion}</strong>{" "}
                                pts/each
                              </Typography>

                              <Chip
                                label={`Grading: ${cfg.scoringMethod}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: "0.725rem",
                                  fontWeight: 700,
                                  height: 22,
                                  bgcolor: "grey.50",
                                  borderColor: "rgba(148, 163, 184, 0.2)",
                                }}
                              />
                            </Box>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Stack>
              )}

              <Divider sx={{ my: { xs: 2, sm: 3 } }} />

              {/* Proceed to Questions Action Bar */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: 2,
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    textAlign: { xs: "center", sm: "left" },
                  }}
                >
                  {typeConfigs.length > 0
                    ? `Ready! You have configured ${typeConfigs.length} matrix type(s). Proceed to create detailed questions.`
                    : "Add at least 1 type config to enable question creation."}
                </Typography>

                <Button
                  variant="contained"
                  color="success"
                  disabled={typeConfigs.length === 0}
                  endIcon={<ArrowRight size={18} />}
                  onClick={() => setShowProceedConfirm(true)}
                  sx={{
                    borderRadius: 2.5,
                    px: { xs: 2.5, sm: 3.5 },
                    py: { xs: 1.2, sm: 1.4 },
                    fontWeight: 800,
                    fontSize: { xs: "0.85rem", sm: "0.95rem" },
                    width: { xs: "100%", sm: "auto" },
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  Create Questions
                </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          /* Step 2 Locked Placeholder */
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 4 },
              textAlign: "center",
              borderRadius: 1,
              bgcolor: "action.hover",
              borderColor: "dashed",
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "text.secondary",
                fontSize: { xs: "0.95rem", sm: "1.1rem" },
              }}
            >
              🔒 Step 2 & 3 Locked
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              Please enter Quiz Information above and click &quot;Create Quiz &
              Continue&quot; first.
            </Typography>
          </Paper>
        )}
      </Stack>

      {/* Add / Edit Type Config Dialog */}
      <TypeConfigDialog
        open={openTypeConfigModal}
        onClose={() => setOpenTypeConfigModal(false)}
        onSave={handleSaveTypeConfig}
        initialData={editingTypeConfig}
        existingTypes={existingTypes}
        loading={createTypeConfigMutation.isPending}
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
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Are you sure you want to delete the matrix config for{" "}
              <Typography
                component="span"
                sx={{ fontWeight: 700, color: "error.main" }}
              >
                &quot;{deletingTypeConfig.questionType}&quot;
              </Typography>
              ?
            </Typography>
          )
        }
      />

      {/* Proceed to Questions Page Confirm Dialog */}
      <ConfirmDialog
        open={showProceedConfirm}
        title="Proceed to Question Creation"
        confirmLabel="Proceed to Questions"
        cancelLabel="Stay Here"
        confirmColor="success"
        onCancel={() => setShowProceedConfirm(false)}
        onConfirm={handleConfirmProceed}
        description={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            The matrix configuration info will be saved and the system will
            proceed to detailed question creation for quiz{" "}
            <Typography
              component="span"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              &quot;{quizTitle}&quot;
            </Typography>
            .
          </Typography>
        }
      />
    </Container>
  );
}
