"use client";

import type { QuizTypeConfigResponse } from "@/lib/type/quizzes";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";

interface TypeConfigsSectionProps {
  typeConfigs: QuizTypeConfigResponse[];
  typeConfigProgress: Array<
    QuizTypeConfigResponse & { actualCount: number; isComplete: boolean }
  >;
  isPendingStatus: boolean;
  onAddConfig: () => void;
  onDeleteConfig: (cfg: QuizTypeConfigResponse) => void;
}

export function TypeConfigsSection({
  typeConfigs,
  typeConfigProgress,
  isPendingStatus,
  onAddConfig,
  onDeleteConfig,
}: TypeConfigsSectionProps) {
  return (
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
              sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", sm: "1.25rem" } }}
            >
              Matrix Type Configurations ({typeConfigs.length})
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              Matrix requirements for questions in this quiz.
            </Typography>
          </Box>

          <Tooltip
            title={
              isPendingStatus
                ? "Type Configs cannot be added when Quiz is pending approval."
                : typeConfigs.length >= 3
                  ? "Maximum 3 type configs reached."
                  : ""
            }
          >
            <Box
              component="span"
              sx={{ width: { xs: "100%", sm: "auto" }, display: "inline-block" }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<Plus size={16} />}
                onClick={onAddConfig}
                disabled={typeConfigs.length >= 3 || isPendingStatus}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  width: "100%",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  px: { xs: 2, sm: 2.5 },
                  py: 1,
                }}
              >
                Add Type Config
              </Button>
            </Box>
          </Tooltip>
        </Box>

        {typeConfigs.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2.5, sm: 3 },
              textAlign: "center",
              borderRadius: 2.5,
              bgcolor: "action.hover",
              borderColor: "dashed",
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              No matrix configuration added. Add at least 1 type config to manage questions.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {typeConfigProgress.map((cfg) => {
              let typeLabel = cfg.questionType as string;
              if (cfg.questionType === "SINGLE_CHOICE")
                typeLabel = "Single Choice";
              if (cfg.questionType === "MULTIPLE_CHOICE")
                typeLabel = "Multiple Choice";
              if (cfg.questionType === "ESSAY") typeLabel = "Essay";

              return (
                <Grid key={cfg.id} size={{ xs: 12, sm: 6 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: { xs: 2, sm: 2.5 },
                      borderRadius: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      borderColor: cfg.isComplete ? "success.main" : "divider",
                      bgcolor: "background.paper",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: cfg.isComplete
                          ? "success.main"
                          : "primary.main",
                        boxShadow: (theme) =>
                          theme.palette.mode === "dark"
                            ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                            : "0 4px 12px rgba(15, 23, 42, 0.04)",
                      },
                    }}
                  >
                    {/* Header: Title on left, Delete on right */}
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

                      <Tooltip
                        title={
                          isPendingStatus
                            ? "Type Configs cannot be deleted when Quiz is pending approval."
                            : ""
                        }
                      >
                        <span>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<Trash2 size={13} />}
                            disabled={isPendingStatus}
                            onClick={() => onDeleteConfig(cfg)}
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
                        </span>
                      </Tooltip>
                    </Box>

                    {/* Footer Stats & Chip */}
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
                        sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                      >
                        Progress: <strong>{cfg.actualCount}</strong> /{" "}
                        {cfg.requiredCount} Qs
                      </Typography>

                      <Chip
                        label={`${cfg.pointsPerQuestion} pts/each`}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "0.725rem",
                          fontWeight: 700,
                          height: 22,
                          bgcolor: "action.hover",
                          borderColor: "divider",
                        }}
                      />
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}
