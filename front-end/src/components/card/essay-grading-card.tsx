"use client";

import { useGradeEssayMutation } from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import type { QuizEssaySubmissionResponse } from "@/lib/type/quizzes";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Save,
  User,
} from "lucide-react";
import { useState } from "react";

export interface EssayGradingCardProps {
  submission: QuizEssaySubmissionResponse;
  onGradedSuccess?: () => void;
}

export function EssayGradingCard({
  submission,
  onGradedSuccess,
}: EssayGradingCardProps) {
  const toast = useToast();
  const gradeMutation = useGradeEssayMutation();

  const [points, setPoints] = useState<string>(
    submission.awardedPoints !== null && submission.awardedPoints !== undefined
      ? String(submission.awardedPoints)
      : "",
  );
  const [feedback, setFeedback] = useState<string>(submission.feedback ?? "");

  const isGraded =
    submission.essayStatus === "GRADED" ||
    (submission.awardedPoints !== null &&
      submission.awardedPoints !== undefined);

  const pointsNum = parseFloat(points);
  const isPointsInvalid =
    points !== "" &&
    (isNaN(pointsNum) || pointsNum < 0 || pointsNum > submission.maxPoints);

  const handleSaveGrade = async () => {
    if (points === "" || isNaN(pointsNum)) {
      toast.error("Please enter awarded points.");
      return;
    }
    if (pointsNum < 0 || pointsNum > submission.maxPoints) {
      toast.error(`Points must be between 0 and ${submission.maxPoints}.`);
      return;
    }

    try {
      await gradeMutation.mutateAsync({
        attemptId: submission.attemptId,
        questionId: submission.questionId,
        data: {
          awardedPoints: pointsNum,
          feedback: feedback.trim() || undefined,
        },
      });
      toast.success("Essay graded successfully!");
      onGradedSuccess?.();
    } catch {
      toast.error("Failed to save grade.");
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 1,
        border: "1px solid",
        borderColor: isGraded ? "success.light" : "divider",
        bgcolor: "background.paper",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      {/* Header: Student Info & Status */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 2.5,
          pb: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: isGraded ? "success.50" : "primary.50",
              color: isGraded ? "success.main" : "primary.main",
              fontWeight: 700,
            }}
          >
            <User size={22} />
          </Avatar>
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, lineHeight: 1.2 }}
            >
              {submission.studentFullName || submission.studentUsername}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{submission.studentUsername} &bull; {submission.assignmentName}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Typography
            variant="caption"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "text.secondary",
            }}
          >
            <Calendar size={14} />
            {formatServerDate(submission.submittedAt, "datetime")}
          </Typography>
          {isGraded ? (
            <Chip
              icon={<CheckCircle2 size={14} />}
              label={`Graded (${submission.awardedPoints}/${submission.maxPoints} pts)`}
              color="success"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          ) : (
            <Chip
              icon={<Clock size={14} />}
              label="Needs Grading"
              color="warning"
              size="small"
              sx={{ fontWeight: 700 }}
            />
          )}
        </Stack>
      </Box>

      {/* Question Prompt */}
      <Box
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 1,
          bgcolor: "action.hover",
          borderLeft: "4px solid",
          borderColor: "primary.main",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "primary.main",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <BookOpen size={14} />
            Question Prompt
          </Typography>
          <Chip
            label={`Max Score: ${submission.maxPoints} pts`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
          />
        </Box>
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: "text.primary" }}
        >
          {submission.questionContent}
        </Typography>
      </Box>

      {/* Student Answer */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: "text.secondary",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            mb: 1,
          }}
        >
          <FileText size={14} />
          Student's Answer
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: "grey.50",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            minHeight: 80,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              lineHeight: 1.6,
              color: submission.answerText ? "text.primary" : "text.secondary",
              fontStyle: submission.answerText ? "normal" : "italic",
            }}
          >
            {submission.answerText
              ? submission.answerText
              : "(No answer text submitted)"}
          </Typography>
        </Paper>
      </Box>

      {/* Inline Grading Form */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 1,
          bgcolor: isGraded ? "success.50" : "primary.50",
          border: "1px dashed",
          borderColor: isGraded ? "success.200" : "primary.200",
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: isGraded ? "success.dark" : "primary.dark",
          }}
        >
          <Award size={18} />
          {isGraded ? "Update Grade & Feedback" : "Grade Essay Submission"}
        </Typography>

        <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
          <Grid
            size={{ xs: 12, md: 8, lg: 9 }}
            sx={{ display: "flex", flexDirection: "column" }}
          >
            <TextField
              label="Feedback / Comments (Optional)"
              multiline
              rows={3.5}
              fullWidth
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter feedback for student..."
              sx={{
                bgcolor: "background.paper",
                borderRadius: 1,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "& .MuiInputBase-root": {
                  height: "100%",
                  alignItems: "flex-start",
                  fontSize: "0.95rem",
                  p: 1.75,
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 3 }}>
            <Stack
              spacing={2}
              sx={{ justifyContent: "space-between", height: "100%" }}
            >
              <TextField
                label="Score"
                type="number"
                fullWidth
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                error={isPointsInvalid}
                helperText={
                  isPointsInvalid
                    ? `Must be 0 - ${submission.maxPoints}`
                    : undefined
                }
                slotProps={{
                  htmlInput: { min: 0, max: submission.maxPoints, step: 0.5 },
                  input: {
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        sx={{
                          "& p": {
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            color: "text.secondary",
                          },
                        }}
                      >
                        / {submission.maxPoints} pts
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  bgcolor: "background.paper",
                  borderRadius: 1,
                  "& .MuiOutlinedInput-root": {
                    alignItems: "center",
                  },
                  "& .MuiInputBase-input": {
                    fontSize: "1rem",
                    fontWeight: 700,
                    py: 1.5,
                    height: "auto",
                    lineHeight: 1.2,
                  },
                }}
              />

              <Button
                variant="contained"
                color={isGraded ? "success" : "primary"}
                startIcon={
                  gradeMutation.isPending ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Save size={18} />
                  )
                }
                onClick={handleSaveGrade}
                disabled={gradeMutation.isPending || isPointsInvalid}
                sx={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  borderRadius: 1,
                  py: 1.25,
                  boxShadow: "none",
                }}
                fullWidth
              >
                {gradeMutation.isPending
                  ? "Saving..."
                  : isGraded
                    ? "Update Grade"
                    : "Save Grade"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Paper>
  );
}
