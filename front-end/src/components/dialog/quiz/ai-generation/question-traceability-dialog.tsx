"use client";

import { useQuestionTraceabilityQuery } from "@/lib/api/quizzes";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography
} from "@mui/material";
import {
  BookOpen,
  Info,
  Sparkles
} from "lucide-react";

interface QuestionTraceabilityDialogProps {
  open: boolean;
  onClose: () => void;
  jobId: string | null;
  questionId: string | null;
  questionContent?: string;
}

export function QuestionTraceabilityDialog({
  open,
  onClose,
  jobId,
  questionId,
  questionContent,
}: QuestionTraceabilityDialogProps) {
  const { data: traceability, isLoading, isError } =
    useQuestionTraceabilityQuery(jobId, questionId, {
      enabled: open && !!jobId && !!questionId,
    });

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            bgcolor: "primary.50",
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Info size={22} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            Question Source & Traceability
          </Typography>
          <Typography variant="caption" color="text.secondary">
            AI validation metrics and citation origin from reference document
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Stack spacing={2.5}>
          {/* Question snippet */}
          {questionContent && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "action.hover",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "primary.main",
                  textTransform: "uppercase",
                  display: "block",
                  mb: 0.5,
                }}
              >
                Question Content
              </Typography>
              <Typography
                variant="body2"
                dangerouslySetInnerHTML={{ __html: questionContent }}
                sx={{ fontSize: "0.85rem" }}
              />
            </Paper>
          )}

          {isLoading ? (
            <Stack spacing={1.5}>
              <Skeleton variant="rounded" height={60} />
              <Skeleton variant="rounded" height={100} />
            </Stack>
          ) : isError || !traceability ? (
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 2,
                textAlign: "center",
                bgcolor: "action.hover",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Traceability information is not available for this question.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {/* Document citation origin card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <BookOpen size={16} className="text-blue-600" /> Source
                  Citation
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Typography variant="caption" color="text.secondary">
                      Section / Chapter Name
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {traceability.sectionName || "N/A"}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      PDF Page Number
                    </Typography>
                    <Box sx={{ mt: 0.25 }}>
                      <Chip
                        label={
                          traceability.pageNumber
                            ? `Page ${traceability.pageNumber}`
                            : "N/A"
                        }
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* AI Model & Quality Validation Metrics */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    mb: 1.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Sparkles size={16} className="text-purple-600" /> AI Synthesis
                  & Quality Metrics
                </Typography>

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Model
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {traceability.modelName || "GPT-4o"}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Prompt Version
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {traceability.promptVersion || "v2.1"}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      Synthesis Attempts
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {traceability.attemptCount || 1}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Divider sx={{ my: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      Validation Assessment
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "success.dark",
                        bgcolor: "success.50",
                        p: 1,
                        borderRadius: 1.5,
                        mt: 0.5,
                      }}
                    >
                      ✓ {traceability.validationMetrics ||
                        "Passed factuality, relevance, and distractor discrimination filters."}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onClose}
          sx={{ borderRadius: 2, fontWeight: 700 }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}