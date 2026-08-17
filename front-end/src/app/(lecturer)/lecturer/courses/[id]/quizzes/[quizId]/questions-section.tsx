"use client";

import type {
  QuestionType,
  QuizQuestionResponse,
  QuizTypeConfigResponse,
} from "@/lib/type/quizzes";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Copy, Edit, FileSpreadsheet, Plus, Trash2 } from "lucide-react";

interface QuestionsSectionProps {
  typeConfigs: QuizTypeConfigResponse[];
  questions: QuizQuestionResponse[];
  totalRequiredQuestions: number;
  isPendingStatus: boolean;
  onAddQuestion: (type: QuestionType) => void;
  onEditQuestion: (question: QuizQuestionResponse) => void;
  onDuplicateQuestion: (question: QuizQuestionResponse) => void;
  onDeleteQuestion: (question: QuizQuestionResponse) => void;
  onImportQuestions: () => void;
}

export function QuestionsSection({
  typeConfigs,
  questions,
  totalRequiredQuestions,
  isPendingStatus,
  onAddQuestion,
  onEditQuestion,
  onDuplicateQuestion,
  onDeleteQuestion,
  onImportQuestions,
}: QuestionsSectionProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2.5,
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Questions Management ({questions.length} / {totalRequiredQuestions}{" "}
            Total)
          </Typography>

          <Tooltip
            title={
              isPendingStatus
                ? "Questions cannot be imported when Quiz is pending approval."
                : typeConfigs.length === 0
                  ? "Please add matrix type configs first."
                  : ""
            }
          >
            <span>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                disabled={isPendingStatus || typeConfigs.length === 0}
                startIcon={<FileSpreadsheet size={16} />}
                onClick={onImportQuestions}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Import Questions
              </Button>
            </span>
          </Tooltip>
        </Box>

        {typeConfigs.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
          >
            Please add matrix type configs above to start adding questions.
          </Typography>
        ) : (
          <Stack spacing={{ xs: 3, sm: 4 }}>
            {typeConfigs.map((cfg) => {
              let typeLabel = cfg.questionType as string;
              if (cfg.questionType === "SINGLE_CHOICE")
                typeLabel = "Single Choice Questions";
              if (cfg.questionType === "MULTIPLE_CHOICE")
                typeLabel = "Multiple Choice Questions";
              if (cfg.questionType === "ESSAY") typeLabel = "Essay Questions";

              const typeQuestions = questions.filter(
                (q) => q.questionType === cfg.questionType,
              );

              return (
                <Box key={cfg.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      mb: 1.5,
                      flexDirection: { xs: "column", sm: "row" },
                      gap: 1.25,
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.95rem", sm: "1.05rem" },
                      }}
                    >
                      {typeLabel} ({typeQuestions.length} / {cfg.requiredCount})
                    </Typography>

                    <Tooltip
                      title={
                        isPendingStatus
                          ? "Questions cannot be added when Quiz is pending approval."
                          : ""
                      }
                    >
                      <Box
                        component="span"
                        sx={{
                          width: { xs: "100%", sm: "auto" },
                          display: "inline-block",
                        }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          disabled={isPendingStatus}
                          startIcon={<Plus size={14} />}
                          onClick={() => onAddQuestion(cfg.questionType)}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            fontSize: { xs: "0.8rem", sm: "0.85rem" },
                            width: "100%",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          Add Question
                        </Button>
                      </Box>
                    </Tooltip>
                  </Box>

                  {typeQuestions.length === 0 ? (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        borderColor: "dashed",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                      >
                        No questions added for this type yet. Click &quot;Add
                        Question&quot; to create one.
                      </Typography>
                    </Paper>
                  ) : (
                    <Stack spacing={1.5}>
                      {typeQuestions.map((q, idx) => (
                        <Paper
                          key={q.id}
                          variant="outlined"
                          sx={{
                            p: { xs: 1.75, sm: 2 },
                            borderRadius: 1.5,
                            bgcolor: "background.paper",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: { xs: "flex-start", sm: "center" },
                              mb: 1.5,
                              flexDirection: { xs: "column", sm: "row" },
                              gap: 1.25,
                            }}
                          >
                            {/* Question Title & Points Badge */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                width: { xs: "100%", sm: "auto" },
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  fontWeight: 800,
                                  color: "primary.main",
                                  fontSize: { xs: "0.875rem", sm: "0.95rem" },
                                }}
                              >
                                Question {idx + 1}
                              </Typography>
                              <Chip
                                label={`${q.points} pts`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  bgcolor: "primary.50",
                                  borderColor: "rgba(59, 130, 246, 0.25)",
                                  color: "primary.dark",
                                }}
                              />
                            </Box>

                            {/* Action Buttons Group */}
                            <Stack
                              direction="row"
                              spacing={0.75}
                              sx={{
                                width: { xs: "100%", sm: "auto" },
                                justifyContent: {
                                  xs: "flex-end",
                                  sm: "flex-start",
                                },
                                pt: { xs: 0.5, sm: 0 },
                                borderTop: {
                                  xs: "1px dashed rgba(148, 163, 184, 0.2)",
                                  sm: "none",
                                },
                              }}
                            >
                              <Tooltip
                                title={
                                  isPendingStatus
                                    ? "Questions cannot be duplicated when Quiz is pending approval."
                                    : ""
                                }
                              >
                                <span>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={isPendingStatus}
                                    startIcon={<Copy size={13} />}
                                    onClick={() => onDuplicateQuestion(q)}
                                    sx={{
                                      borderRadius: 1.5,
                                      fontSize: {
                                        xs: "0.725rem",
                                        sm: "0.75rem",
                                      },
                                      px: { xs: 1, sm: 1.25 },
                                      py: 0.3,
                                      whiteSpace: "nowrap",
                                      flexShrink: 0,
                                    }}
                                  >
                                    Duplicate
                                  </Button>
                                </span>
                              </Tooltip>
                              <Tooltip
                                title={
                                  isPendingStatus
                                    ? "Questions cannot be edited when Quiz is pending approval."
                                    : ""
                                }
                              >
                                <span>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="primary"
                                    disabled={isPendingStatus}
                                    startIcon={<Edit size={13} />}
                                    onClick={() => onEditQuestion(q)}
                                    sx={{
                                      borderRadius: 1.5,
                                      fontSize: {
                                        xs: "0.725rem",
                                        sm: "0.75rem",
                                      },
                                      px: { xs: 1, sm: 1.25 },
                                      py: 0.3,
                                      whiteSpace: "nowrap",
                                      flexShrink: 0,
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </span>
                              </Tooltip>
                              <Tooltip
                                title={
                                  isPendingStatus
                                    ? "Questions cannot be deleted when Quiz is pending approval."
                                    : ""
                                }
                              >
                                <span>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    color="error"
                                    disabled={isPendingStatus}
                                    startIcon={<Trash2 size={13} />}
                                    onClick={() => onDeleteQuestion(q)}
                                    sx={{
                                      borderRadius: 1.5,
                                      fontSize: {
                                        xs: "0.725rem",
                                        sm: "0.75rem",
                                      },
                                      px: { xs: 1, sm: 1.25 },
                                      py: 0.3,
                                      whiteSpace: "nowrap",
                                      flexShrink: 0,
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </span>
                              </Tooltip>
                            </Stack>
                          </Box>

                          <Typography
                            variant="body2"
                            dangerouslySetInnerHTML={{
                              __html: q.content,
                            }}
                            sx={{
                              mb: 1.5,
                              fontSize: { xs: "0.825rem", sm: "0.875rem" },
                              overflowX: "auto",
                            }}
                          />

                          {q.options && q.options.length > 0 && (
                            <Grid container spacing={1}>
                              {q.options.map((opt) => (
                                <Grid key={opt.id} size={{ xs: 12, sm: 6 }}>
                                  <Box
                                    sx={{
                                      px: 1.5,
                                      py: 0.8,
                                      borderRadius: 1.5,
                                      fontSize: {
                                        xs: "0.775rem",
                                        sm: "0.82rem",
                                      },
                                      wordBreak: "break-word",
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
                                    }}
                                  >
                                    {opt.isCorrect ? "✓ " : "• "}{" "}
                                    {opt.optionText}
                                  </Box>
                                </Grid>
                              ))}
                            </Grid>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
