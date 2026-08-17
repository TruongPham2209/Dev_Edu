"use client";

import { ExamAutosaveIndicator } from "@/app/(student)/courses/[id]/quizzes/[assignmentId]/exam/exam-autosave-indicator";
import { ExamTimer } from "@/app/(student)/courses/[id]/quizzes/[assignmentId]/exam/exam-timer";
import type { AutosaveState } from "@/hooks/use-quiz-exam-session";
import type { StudentQuestionDto } from "@/lib/type/quizzes";
import {
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { Send } from "lucide-react";

interface ExamQuestionNavProps {
  questions: StudentQuestionDto[];
  currentIndex: number;
  answersMap: Record<
    string,
    { selectedOptionIds?: string[]; answerText?: string }
  >;
  onSelectQuestion: (index: number) => void;
  quizTitle?: string;
  attemptNumber?: number;
  autosaveState?: AutosaveState;
  timeRemainingSeconds?: number;
  onSubmitClick?: () => void;
  submitPending?: boolean;
}

export function ExamQuestionNav({
  questions,
  currentIndex,
  answersMap,
  onSelectQuestion,
  quizTitle,
  attemptNumber,
  autosaveState = "SAVED",
  timeRemainingSeconds = 0,
  onSubmitClick,
  submitPending = false,
}: ExamQuestionNavProps) {
  const theme = useTheme();

  const isQuestionAnswered = (q: StudentQuestionDto) => {
    const ans = answersMap[q.id];
    if (!ans) return false;
    if (q.questionType === "ESSAY") {
      return !!ans.answerText && ans.answerText.trim().length > 0;
    }
    return !!ans.selectedOptionIds && ans.selectedOptionIds.length > 0;
  };

  const answeredCount = questions.filter(isQuestionAnswered).length;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        bgcolor: "background.paper",
        borderRadius: 3,
        border: 1,
        borderColor: "divider",
        boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
      }}
    >
      {/* Quiz Header & Info */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1,
            mb: 0.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1.3, fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {quizTitle || "Online Quiz"}
          </Typography>
          <ExamAutosaveIndicator state={autosaveState} />
        </Box>
        {attemptNumber !== undefined && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Attempt number {attemptNumber}
          </Typography>
        )}
      </Box>

      {/* Timer */}
      <Box sx={{ mb: 2.5 }}>
        <ExamTimer timeRemainingSeconds={timeRemainingSeconds} />
      </Box>

      <Divider sx={{ mb: 2.5 }} />

      {/* Question Matrix Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          Question List
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600 }}
        >
          Answered: {answeredCount}/{questions.length}
        </Typography>
      </Box>

      {/* Question Matrix Grid */}
      <Grid container spacing={1.25}>
        {questions.map((q, idx) => {
          const answered = isQuestionAnswered(q);
          const active = idx === currentIndex;

          return (
            <Grid key={q.id} size={{ xs: 3, sm: 4 }}>
              <Button
                variant={active || answered ? "contained" : "outlined"}
                disableElevation
                onClick={() => onSelectQuestion(idx)}
                fullWidth
                sx={{
                  minWidth: 0,
                  height: 42,
                  p: 0,
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: active
                    ? "primary.main"
                    : answered
                      ? alpha(theme.palette.success.main, 0.15)
                      : "background.paper",
                  color: active
                    ? "primary.contrastText"
                    : answered
                      ? "success.dark"
                      : "text.secondary",
                  borderColor: active
                    ? "primary.main"
                    : answered
                      ? "success.main"
                      : "divider",
                  borderWidth: active ? 2 : 1,
                  boxShadow: active
                    ? `0 0 0 2px ${alpha(theme.palette.primary.main, 0.25)}`
                    : "none",
                  "&:hover": {
                    bgcolor: active
                      ? "primary.dark"
                      : answered
                        ? alpha(theme.palette.success.main, 0.25)
                        : "action.hover",
                    borderColor: active
                      ? "primary.dark"
                      : answered
                        ? "success.main"
                        : "text.secondary",
                  },
                }}
              >
                {idx + 1}
              </Button>
            </Grid>
          );
        })}
      </Grid>

      {/* Legend */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1.5,
          mt: 3,
          pt: 2,
          borderTop: 1,
          borderColor: "divider",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 0.75,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: "primary.main",
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Current
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 0.75,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: alpha(theme.palette.success.main, 0.15),
              border: 1,
              borderColor: "success.main",
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Answered
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 0.75,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            Unanswered
          </Typography>
        </Box>
      </Box>

      {/* Submit Button at Bottom */}
      {onSubmitClick && (
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            startIcon={<Send size={18} />}
            onClick={onSubmitClick}
            disabled={submitPending}
            sx={{ borderRadius: 2.5, py: 1.2, fontWeight: 700 }}
          >
            Submit
          </Button>
        </Box>
      )}
    </Box>
  );
}

