"use client";

import type { QuizResponse, QuizTypeConfigResponse } from "@/lib/type/quizzes";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircle2, Send } from "lucide-react";

interface ProgressSummaryCardProps {
  typeConfigProgress: Array<
    QuizTypeConfigResponse & { actualCount: number; isComplete: boolean }
  >;
  quizDetail: QuizResponse | null;
  isAllConfigComplete: boolean;
  isSubmitting: boolean;
  onSubmitClick: () => void;
}

export function ProgressSummaryCard({
  typeConfigProgress,
  quizDetail,
  isAllConfigComplete,
  isSubmitting,
  onSubmitClick,
}: ProgressSummaryCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
        bgcolor: "background.paper",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            mb: 1,
            fontSize: { xs: "1rem", sm: "1.15rem" },
          }}
        >
          Progress Summary
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
        >
          Question configuration status relative to matrix requirements.
        </Typography>

        <Divider sx={{ my: 1.5 }} />

        <Stack spacing={2} sx={{ mb: 3 }}>
          {typeConfigProgress.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              No matrix types configured yet.
            </Typography>
          ) : (
            typeConfigProgress.map((cfg) => {
              let label = cfg.questionType as string;
              if (cfg.questionType === "SINGLE_CHOICE") label = "Single Choice";
              if (cfg.questionType === "MULTIPLE_CHOICE")
                label = "Multiple Choice";
              if (cfg.questionType === "ESSAY") label = "Essay";

              const percentage = Math.min(
                100,
                Math.round((cfg.actualCount / cfg.requiredCount) * 100),
              );

              return (
                <Box key={cfg.id}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      }}
                    >
                      {label}
                    </Typography>
                    <Chip
                      label={`${cfg.actualCount} / ${cfg.requiredCount}`}
                      size="small"
                      color={cfg.isComplete ? "success" : "warning"}
                      sx={{
                        height: 20,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentage}
                    color={cfg.isComplete ? "success" : "warning"}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              );
            })
          )}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* Submit Quiz Action Button */}
        {quizDetail?.status === "DRAFT" ? (
          <Button
            variant="contained"
            color="warning"
            fullWidth
            disabled={!isAllConfigComplete || isSubmitting}
            startIcon={<Send size={16} />}
            onClick={onSubmitClick}
            sx={{
              py: { xs: 1.2, sm: 1.4 },
              borderRadius: 2.5,
              fontWeight: 800,
              fontSize: { xs: "0.875rem", sm: "0.95rem" },
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Submit Quiz For Approval
          </Button>
        ) : (
          <Box sx={{ textAlign: "center", py: 1 }}>
            <Chip
              icon={<CheckCircle2 size={14} />}
              label={`Status: ${quizDetail?.status}`}
              color={quizDetail?.status === "APPROVED" ? "success" : "info"}
              sx={{ fontWeight: 700 }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
