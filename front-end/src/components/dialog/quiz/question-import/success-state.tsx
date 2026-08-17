"use client";

import type { QuizQuestionRequest } from "@/lib/type/quizzes";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { CheckCircle2, Trash2 } from "lucide-react";

interface ImportSuccessStateProps {
  parsedQuestions: QuizQuestionRequest[];
  isSaving: boolean;
  onRemoveQuestionClick: (index: number) => void;
  onReset: () => void;
}

export function ImportSuccessState({
  parsedQuestions,
  isSaving,
  onRemoveQuestionClick,
  onReset,
}: ImportSuccessStateProps) {
  return (
    <Stack spacing={2.5}>
      <Alert
        severity="success"
        icon={<CheckCircle2 size={20} />}
        sx={{ borderRadius: 2 }}
      >
        Successfully parsed <strong>{parsedQuestions.length}</strong> valid
        questions from file! Please review the questions below before saving.
      </Alert>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Parsed Questions List ({parsedQuestions.length})
        </Typography>

        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={isSaving}
          onClick={onReset}
          sx={{ borderRadius: 2 }}
        >
          Re-upload File
        </Button>
      </Box>

      <Stack spacing={1.5}>
        {parsedQuestions.map((q, idx) => {
          let typeLabel = q.questionType as string;
          if (q.questionType === "SINGLE_CHOICE") typeLabel = "Single Choice";
          if (q.questionType === "MULTIPLE_CHOICE")
            typeLabel = "Multiple Choice";
          if (q.questionType === "ESSAY") typeLabel = "Essay";

          return (
            <Paper
              key={idx}
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.paper",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center" }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    Question {idx + 1}
                  </Typography>
                  <Chip
                    label={typeLabel}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                  />
                </Stack>

                <Tooltip title="Remove this question">
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={isSaving}
                      onClick={() => onRemoveQuestionClick(idx)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  fontWeight: 500,
                  mb: 1,
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
              >
                {q.content}
              </Typography>

              {q.options && q.options.length > 0 && (
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  {q.options.map((opt, oIdx) => (
                    <Grid key={oIdx} size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          px: 1.2,
                          py: 0.75,
                          borderRadius: 1,
                          fontSize: "0.8rem",
                          bgcolor: opt.isCorrect
                            ? "rgba(34, 197, 94, 0.1)"
                            : "action.hover",
                          color: opt.isCorrect
                            ? "success.dark"
                            : "text.primary",
                          fontWeight: opt.isCorrect ? 700 : 400,
                          border: opt.isCorrect
                            ? "1px solid rgba(34, 197, 94, 0.3)"
                            : "1px solid transparent",
                          wordBreak: "break-word",
                          whiteSpace: "pre-wrap",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 0.75,
                        }}
                      >
                        <Box
                          component="span"
                          sx={{ flexShrink: 0, fontWeight: 700 }}
                        >
                          {opt.isCorrect ? "✓" : "•"}
                        </Box>
                        <Box component="span" sx={{ flex: 1 }}>
                          {opt.optionText}
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          );
        })}
      </Stack>
    </Stack>
  );
}
