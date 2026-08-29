"use client";

import { useQuizGenerationJobQuery } from "@/lib/api/quizzes";
import type {
  QuizGenerationJobResponse,
  QuizGenerationJobStatus,
} from "@/lib/type/quizzes";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from "@mui/material";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  Sparkles,
  XCircle
} from "lucide-react";
import { useEffect, useMemo } from "react";

interface AiProgressDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string | null;
  onSuccess: (job: QuizGenerationJobResponse) => void;
}

const PIPELINE_STEPS: {
  key: QuizGenerationJobStatus;
  label: string;
  description: string;
}[] = [
    {
      key: "DOCUMENT_PROCESSING",
      label: "Document Processing",
      description: "Extracting text, OCR, and chunking knowledge from document",
    },
    {
      key: "RELEVANCE_CHECKING",
      label: "Relevance Validation",
      description: "Verifying document content matches course syllabus",
    },
    {
      key: "KNOWLEDGE_EVALUATING",
      label: "Knowledge Evaluation",
      description: "Evaluating usable capacity for requested questions",
    },
    {
      key: "PLANNING",
      label: "Matrix Planning",
      description: "Allocating question distribution across topics",
    },
    {
      key: "GENERATING",
      label: "AI Question Generation",
      description: "Synthesizing high-quality questions and distractor options",
    },
    {
      key: "VALIDATING",
      label: "Quality Validation",
      description: "Auditing factuality, discrimination, and filtering duplicates",
    },
  ];

export function AiProgressDialog({
  open,
  onClose,
  jobId,
  onSuccess,
}: AiProgressDialogProps) {
  const { data: job } = useQuizGenerationJobQuery(jobId, {
    enabled: open && !!jobId,
  });

  const status = job?.status || "PENDING";
  const currentStep = job?.currentStep || "PENDING";

  const isTerminalSuccess = status === "COMPLETED";
  const isTerminalPartial = status === "PARTIAL";
  const isTerminalError = [
    "FAILED",
    "IRRELEVANT_DOCUMENT",
    "INSUFFICIENT_SOURCE",
    "INVALID_REQUEST",
    "TIMEOUT",
    "CANCELLED",
  ].includes(status);

  const isDone = isTerminalSuccess || isTerminalPartial;

  // Auto trigger onSuccess callback once when finished
  useEffect(() => {
    if (job && (job.status === "COMPLETED" || job.status === "PARTIAL")) {
      onSuccess(job);
    }
  }, [job?.status]);

  // Compute progress percentage
  const progressPercent = useMemo(() => {
    if (isTerminalSuccess) return 100;
    if (isTerminalPartial) {
      if (!job?.requestedTotal || job.requestedTotal === 0) return 100;
      return Math.round((job.acceptedCount / job.requestedTotal) * 100);
    }
    if (isTerminalError) return 100;

    switch (status) {
      case "PENDING":
        return 5;
      case "DOCUMENT_PROCESSING":
        return 20;
      case "RELEVANCE_CHECKING":
        return 35;
      case "KNOWLEDGE_EVALUATING":
        return 45;
      case "PLANNING":
        return 55;
      case "GENERATING": {
        const total = job?.requestedTotal || 1;
        const accepted = job?.acceptedCount || 0;
        return 55 + Math.round((accepted / total) * 30);
      }
      case "VALIDATING":
        return 90;
      default:
        return 10;
    }
  }, [status, job, isTerminalSuccess, isTerminalPartial, isTerminalError]);

  // Active step index
  const activeStepIndex = useMemo(() => {
    if (isTerminalSuccess) return PIPELINE_STEPS.length;
    const idx = PIPELINE_STEPS.findIndex(
      (s) => s.key === status || s.key === currentStep,
    );
    return idx >= 0 ? idx : 0;
  }, [status, currentStep, isTerminalSuccess]);

  return (
    <Dialog
      open={open}
      onClose={isDone || isTerminalError ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2.5,
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1,
          pt: 2.5,
          px: 3,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: isTerminalSuccess
              ? "success.50"
              : isTerminalPartial
                ? "warning.50"
                : isTerminalError
                  ? "error.50"
                  : "primary.50",
            color: isTerminalSuccess
              ? "success.main"
              : isTerminalPartial
                ? "warning.main"
                : isTerminalError
                  ? "error.main"
                  : "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isTerminalSuccess ? (
            <CheckCircle2 size={24} />
          ) : isTerminalPartial ? (
            <AlertTriangle size={24} />
          ) : isTerminalError ? (
            <XCircle size={24} />
          ) : (
            <Sparkles size={24} />
          )}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {isTerminalSuccess
              ? "Generation Completed Successfully"
              : isTerminalPartial
                ? "Generation Completed (Partial)"
                : isTerminalError
                  ? "Generation Failed"
                  : "AI Generation Pipeline in Progress"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {job?.documentName
              ? `Source: ${job.documentName}`
              : "Analyzing source knowledge and synthesizing questions"}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={2.5}>
          {/* Progress Bar & Percentage */}
          <Box>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {isTerminalSuccess
                  ? "100% Completed"
                  : isTerminalPartial
                    ? `${job?.acceptedCount || 0}/${job?.requestedTotal || 0} Questions Generated`
                    : isTerminalError
                      ? "Process Terminated"
                      : `${progressPercent}% Progress`}
              </Typography>
              {!isDone && !isTerminalError && (
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <CircularProgress size={14} thickness={5} />
                  <Typography variant="caption" color="text.secondary">
                    Live Polling
                  </Typography>
                </Stack>
              )}
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progressPercent}
              color={
                isTerminalSuccess
                  ? "success"
                  : isTerminalPartial
                    ? "warning"
                    : isTerminalError
                      ? "error"
                      : "primary"
              }
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "action.hover",
              }}
            />
          </Box>

          {/* Metrics summary badges */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Accepted
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "success.main" }}
                >
                  {job?.acceptedCount ?? 0}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Rejected / Retried
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: job?.rejectedCount ? "error.main" : "text.secondary",
                  }}
                >
                  {job?.rejectedCount ?? 0}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Requested Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {job?.requestedTotal ?? 0}
                </Typography>
              </Grid>

              <Grid size={{ xs: 6, sm: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Execution Time
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {job?.executionTimeMs
                    ? `${(job.executionTimeMs / 1000).toFixed(1)}s`
                    : "--"}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Business & System Error Alerts */}
          {status === "IRRELEVANT_DOCUMENT" && (
            <Alert severity="warning" icon={<AlertCircle size={20} />}>
              <AlertTitle sx={{ fontWeight: 700 }}>
                Document Not Relevant
              </AlertTitle>
              {job?.errorMessage ||
                "The provided document does not contain relevant subject matter for this course. Please upload another PDF document."}
            </Alert>
          )}

          {status === "INSUFFICIENT_SOURCE" && (
            <Alert severity="warning" icon={<AlertTriangle size={20} />}>
              <AlertTitle sx={{ fontWeight: 700 }}>
                Insufficient Knowledge Source
              </AlertTitle>
              {job?.errorMessage ||
                "The document is too concise or lacks sufficient concepts to generate the full number of requested questions. Try a more comprehensive textbook or decrease the question quota."}
            </Alert>
          )}

          {isTerminalPartial && (
            <Alert severity="warning">
              <AlertTitle sx={{ fontWeight: 700 }}>
                Partial Generation Completed
              </AlertTitle>
              Generated {job?.acceptedCount} out of {job?.requestedTotal}{" "}
              questions. The source document capacity was exhausted.
            </Alert>
          )}

          {status === "FAILED" && (
            <Alert severity="error">
              <AlertTitle sx={{ fontWeight: 700 }}>Pipeline Error</AlertTitle>
              {job?.errorMessage ||
                "An unexpected error occurred while processing the document or calling the AI model."}
            </Alert>
          )}

          {status === "TIMEOUT" && (
            <Alert severity="error">
              <AlertTitle sx={{ fontWeight: 700 }}>Job Timeout</AlertTitle>
              Processing exceeded the maximum time limit. Please retry with a smaller PDF file.
            </Alert>
          )}

          {/* Pipeline Step Checklist */}
          {!isTerminalError && (
            <Stack spacing={1.2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Pipeline Execution Steps:
              </Typography>
              {PIPELINE_STEPS.map((step, idx) => {
                const isPassed = idx < activeStepIndex;
                const isCurrent = idx === activeStepIndex && !isTerminalSuccess;

                return (
                  <Stack
                    key={step.key}
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                      p: 1.25,
                      borderRadius: 1.5,
                      bgcolor: isCurrent
                        ? "rgba(37, 99, 235, 0.04)"
                        : "transparent",
                      border: isCurrent
                        ? "1px solid rgba(37, 99, 235, 0.2)"
                        : "1px solid transparent",
                    }}
                  >
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isPassed
                          ? "success.50"
                          : isCurrent
                            ? "primary.50"
                            : "action.hover",
                        color: isPassed
                          ? "success.main"
                          : isCurrent
                            ? "primary.main"
                            : "text.disabled",
                        flexShrink: 0,
                      }}
                    >
                      {isPassed ? (
                        <CheckCircle size={15} />
                      ) : isCurrent ? (
                        <CircularProgress size={13} thickness={5} />
                      ) : (
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {idx + 1}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isCurrent || isPassed ? 700 : 500,
                          color: isCurrent
                            ? "primary.main"
                            : isPassed
                              ? "text.primary"
                              : "text.secondary",
                        }}
                      >
                        {step.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {step.description}
                      </Typography>
                    </Box>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        {isDone ? (
          <Button
            variant="contained"
            color="primary"
            onClick={onClose}
            startIcon={<CheckCircle2 size={16} />}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Done & View Questions
          </Button>
        ) : isTerminalError ? (
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Close
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Run in Background
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}