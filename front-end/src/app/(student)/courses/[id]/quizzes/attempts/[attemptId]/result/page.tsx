"use client";

import { QuestionResultCard } from "@/components/card/question-result-card";
import { ErrorState } from "@/components/common/error-state";
import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import { useAttemptResultQuery } from "@/lib/api/quizzes";
import type { AttemptQuestionResultDto } from "@/lib/type/quizzes";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { ArrowLeft, LayoutGrid, X } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";

function QuizResultSkeleton() {
  return (
    <Container
      maxWidth="xl"
      sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 } }}
    >
      <Box sx={{ mb: 2 }}>
        <Skeleton
          variant="rounded"
          width={140}
          height={36}
          sx={{ borderRadius: 2 }}
        />
      </Box>

      <Grid container spacing={{ xs: 2.5, lg: 3 }}>
        {/* Left Side: Question Cards Grid Skeleton (3 per row) */}
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Box sx={{ mb: 2.5 }}>
            <Skeleton variant="text" width="40%" height={32} />
          </Box>

          <Grid container spacing={2.5}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 1.5,
                    p: { xs: 2, sm: 2.5 },
                    height: "100%",
                  }}
                >
                  <Stack spacing={2}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Skeleton variant="rounded" width={70} height={24} />
                      <Skeleton variant="rounded" width={50} height={20} />
                    </Box>
                    <Skeleton variant="text" width="90%" height={24} />
                    <Skeleton variant="text" width="60%" height={20} />
                    <Stack spacing={1} sx={{ mt: 1 }}>
                      <Skeleton
                        variant="rounded"
                        height={36}
                        sx={{ borderRadius: 2 }}
                      />
                      <Skeleton
                        variant="rounded"
                        height={36}
                        sx={{ borderRadius: 2 }}
                      />
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* Right Side: Sticky Summary Panel Skeleton */}
        <Grid
          size={{ xs: 12, lg: 3.5 }}
          sx={{ display: { xs: "none", lg: "block" } }}
        >
          <Card
            variant="outlined"
            sx={{ borderRadius: 1.5, p: { xs: 2, sm: 3 } }}
          >
            <Stack spacing={2.5}>
              <Skeleton variant="rounded" width={120} height={24} />
              <Skeleton
                variant="rounded"
                height={100}
                sx={{ borderRadius: 1 }}
              />
              <Divider />
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton
                variant="rounded"
                height={120}
                sx={{ borderRadius: 1 }}
              />
              <Divider />
              <Skeleton variant="text" width={120} height={20} />
              <Grid container spacing={1}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <Grid key={n} size={{ xs: 4 }}>
                    <Skeleton
                      variant="rounded"
                      height={38}
                      sx={{ borderRadius: 2 }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function CourseStudentAttemptResultPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id: courseId, attemptId } = use(params);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: result,
    isLoading,
    isError,
    refetch,
  } = useAttemptResultQuery(attemptId);

  if (isLoading) {
    return <QuizResultSkeleton />;
  }

  if (isError || !result) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <ErrorState
          title="Failed to load quiz results"
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  const isGraded = result.status === "GRADED";
  const percentage =
    result.totalScore !== null && result.totalScore !== undefined
      ? Math.round((result.totalScore / result.maxScore) * 100)
      : 0;

  const questionsList: AttemptQuestionResultDto[] = result.answers || [];
  const quizTitle = result.quizTitle || "Quiz Results";

  // Statistics breakdown
  const singleChoiceQuestions = questionsList.filter(
    (q) => q.questionType === "SINGLE_CHOICE",
  );
  const correctSingleChoice = singleChoiceQuestions.filter(
    (q) => q.isCorrect === true,
  ).length;

  const multipleChoiceQuestions = questionsList.filter(
    (q) => q.questionType === "MULTIPLE_CHOICE",
  );
  const correctMultipleChoice = multipleChoiceQuestions.filter(
    (q) => q.isCorrect === true,
  ).length;

  const essayQuestions = questionsList.filter(
    (q) => q.questionType === "ESSAY",
  );
  const awardedEssayPoints = essayQuestions.reduce(
    (acc: number, q: AttemptQuestionResultDto) => acc + (q.awardedPoints ?? 0),
    0,
  );
  const maxEssayPoints = essayQuestions.reduce(
    (acc: number, q: AttemptQuestionResultDto) => acc + (q.questionPoints ?? 0),
    0,
  );

  const objectiveQuestions = [
    ...singleChoiceQuestions,
    ...multipleChoiceQuestions,
  ];
  const totalObjectiveCorrect = correctSingleChoice + correctMultipleChoice;

  const handleScrollToQuestion = (qId: string | number) => {
    setIsDrawerOpen(false);
    const el = document.getElementById(`question-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const summaryPanelContent = (
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Result
        </Typography>
        <QuizStatusChip status={result.status} />
      </Box>

      {/* Submitted Timestamp inside Sticky Panel */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 2 }}
      >
        Submitted at:{" "}
        {result.submittedAt
          ? formatServerDate(result.submittedAt, "datetime")
          : "N/A"}
      </Typography>

      {/* Score & Percentage Box */}
      {isGraded ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 1,
            textAlign: "center",
            bgcolor: (theme) =>
              alpha(
                theme.palette[percentage >= 50 ? "success" : "error"].main,
                theme.palette.mode === "dark" ? 0.18 : 0.08,
              ),
            borderColor: percentage >= 50 ? "success.main" : "error.main",
            mb: 3,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 700, textTransform: "uppercase" }}
          >
            Total Score Obtained
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              color: percentage >= 50 ? "success.main" : "error.main",
              my: 0.5,
            }}
          >
            {result.totalScore}{" "}
            <Typography component="span" variant="h6" color="text.secondary">
              / {result.maxScore}
            </Typography>
          </Typography>
          <Chip
            label={`${percentage}% Marks`}
            color={percentage >= 50 ? "success" : "error"}
            size="small"
            sx={{ fontWeight: 700 }}
          />
        </Paper>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 1,
            textAlign: "center",
            bgcolor: (theme) =>
              alpha(
                theme.palette.warning.main,
                theme.palette.mode === "dark" ? 0.18 : 0.08,
              ),
            borderColor: "warning.main",
            mb: 3,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, color: "warning.main" }}
          >
            Pending Instructor Grading
          </Typography>
        </Paper>
      )}

      {/* Correct Answers & Breakdown */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Answer Breakdown
      </Typography>

      <Stack spacing={1.5} sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Overall Objective Correct:
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {totalObjectiveCorrect} / {objectiveQuestions.length}
          </Typography>
        </Box>

        {singleChoiceQuestions.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Single Choice Correct:
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {correctSingleChoice} / {singleChoiceQuestions.length}
            </Typography>
          </Box>
        )}

        {multipleChoiceQuestions.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Multiple Choice Correct:
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {correctMultipleChoice} / {multipleChoiceQuestions.length}
            </Typography>
          </Box>
        )}

        {essayQuestions.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Essay Awarded Points:
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {awardedEssayPoints} / {maxEssayPoints} pts
            </Typography>
          </Box>
        )}
      </Stack>

      <Divider sx={{ mb: 2.5 }} />

      {/* Question Matrix Navigation */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
        Question Matrix (Click to View)
      </Typography>

      <Grid container spacing={1}>
        {questionsList.map((q, idx) => {
          const qId = q.questionId || idx;
          const isEssay = q.questionType === "ESSAY";
          const isCorrect = q.isCorrect;
          let btnBg = "action.hover";
          let btnColor = "text.primary";

          if (isEssay) {
            if (q.awardedPoints != null && q.awardedPoints > 0) {
              btnBg = "success.main";
              btnColor = "common.white";
            } else if (q.awardedPoints === 0) {
              btnBg = "error.main";
              btnColor = "common.white";
            } else {
              btnBg = "warning.main";
              btnColor = "common.white";
            }
          } else if (isCorrect === true) {
            btnBg = "success.main";
            btnColor = "common.white";
          } else if (isCorrect === false) {
            btnBg = "error.main";
            btnColor = "common.white";
          }

          return (
            <Grid key={qId} size={{ xs: 3, sm: 4 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleScrollToQuestion(qId)}
                sx={{
                  minWidth: 0,
                  width: "100%",
                  height: 38,
                  p: 0,
                  borderRadius: 1.5,
                  bgcolor: btnBg,
                  color: btnColor,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  boxShadow: "none",
                  "&:hover": {
                    opacity: 0.9,
                    bgcolor: btnBg,
                  },
                }}
              >
                {idx + 1}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </CardContent>
  );

  return (
    <Container
      maxWidth="xl"
      sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 } }}
    >
      {/* Top Header Navigation & Mobile Capsule */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Link href={`/courses/${courseId}/quizzes`} passHref>
          <Button startIcon={<ArrowLeft size={18} />} sx={{ borderRadius: 2 }}>
            Back to Quizzes
          </Button>
        </Link>

        {/* Mobile & Tablet Action Bar Pill (< lg) */}
        <Paper
          elevation={0}
          sx={{
            display: { xs: "flex", lg: "none" },
            alignItems: "center",
            gap: { xs: 0.75, sm: 1 },
            p: 0.5,
            px: { xs: 1, sm: 1.5 },
            borderRadius: 9999,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            maxWidth: "100%",
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {isGraded ? (
            <Chip
              label={`Score: ${result.totalScore}/${result.maxScore}`}
              color={percentage >= 50 ? "success" : "error"}
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: 9999,
                height: { xs: 26, sm: 28 },
                fontSize: { xs: "0.725rem", sm: "0.775rem" },
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            />
          ) : (
            <Chip
              label="Pending Grading"
              color="warning"
              size="small"
              sx={{
                fontWeight: 700,
                borderRadius: 9999,
                height: { xs: 26, sm: 28 },
                fontSize: { xs: "0.725rem", sm: "0.775rem" },
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            />
          )}

          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => setIsDrawerOpen(true)}
            startIcon={<LayoutGrid size={14} />}
            sx={{
              borderRadius: 9999,
              fontWeight: 700,
              fontSize: { xs: "0.725rem", sm: "0.75rem" },
              px: { xs: 1.25, sm: 1.75 },
              py: 0.5,
              whiteSpace: "nowrap",
              flexShrink: 0,
              lineHeight: 1.2,
            }}
          >
            Matrix
          </Button>
        </Paper>
      </Box>

      {!isGraded && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Quiz pending instructor grading
          </Typography>
          <Typography variant="body2">
            Your submission contains essay questions currently being graded by
            the instructor. Please check back later for final results.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={{ xs: 2.5, lg: 3 }}>
        {/* Main Section: Question Cards Grid (3 per row) */}
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, fontSize: { xs: "1.2rem", sm: "1.5rem" } }}
            >
              {quizTitle}
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {questionsList.map((q, idx) => {
              const qId = q.questionId || idx;
              return (
                <Grid
                  key={qId}
                  id={`question-${qId}`}
                  size={{ xs: 12, sm: 6, md: 4 }}
                >
                  <QuestionResultCard
                    question={q}
                    index={idx}
                    isGraded={isGraded}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Right Side: Sticky Result Summary Panel (Desktop lg and up) */}
        <Grid
          size={{ xs: 12, lg: 3.5 }}
          sx={{ display: { xs: "none", lg: "block" } }}
        >
          <Box sx={{ position: "sticky", top: 96 }}>
            <Card
              sx={{
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 10px 30px rgba(0,0,0,0.5)"
                    : "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              {summaryPanelContent}
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Mobile/Tablet Result Matrix Bottom Sheet Drawer */}
      <Drawer
        anchor="bottom"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        slotProps={{
          backdrop: { sx: { backdropFilter: "blur(4px)" } },
          paper: {
            sx: {
              borderRadius: "20px 20px 0 0",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.paper",
            },
          },
        }}
      >
        <Box
          sx={{
            p: 2,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            position: "sticky",
            top: 0,
            bgcolor: "background.paper",
            zIndex: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Result Summary & Question Matrix
          </Typography>
          <IconButton onClick={() => setIsDrawerOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ overflowY: "auto", flex: 1 }}>{summaryPanelContent}</Box>
      </Drawer>
    </Container>
  );
}
