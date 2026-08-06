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
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Matrix Type Configurations ({typeConfigs.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
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
            <span>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Plus size={16} />}
                onClick={onAddConfig}
                disabled={typeConfigs.length >= 3 || isPendingStatus}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Add Type Config
              </Button>
            </span>
          </Tooltip>
        </Box>

        {typeConfigs.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 2.5,
              bgcolor: "action.hover",
              borderColor: "dashed",
            }}
          >
            <Typography variant="body2" color="text.secondary">
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
                      p: 2,
                      borderRadius: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderColor: cfg.isComplete
                        ? "rgba(34, 197, 94, 0.4)"
                        : "rgba(0,0,0,0.12)",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: "primary.main",
                        }}
                      >
                        {typeLabel}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        Progress: <strong>{cfg.actualCount}</strong> / {cfg.requiredCount} Qs
                      </Typography>
                      <Chip
                        label={`${cfg.pointsPerQuestion} pts/each`}
                        size="small"
                        variant="outlined"
                        sx={{
                          mt: 0.5,
                          fontSize: "0.7rem",
                          height: 20,
                        }}
                      />
                    </Box>

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
                          startIcon={<Trash2 size={14} />}
                          disabled={isPendingStatus}
                          onClick={() => onDeleteConfig(cfg)}
                          sx={{ borderRadius: 2 }}
                        >
                          Delete
                        </Button>
                      </span>
                    </Tooltip>
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
