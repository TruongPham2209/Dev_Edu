"use client";

import { ErrorState } from "@/components/common/error-state";
import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import { useAttemptResultQuery } from "@/lib/api/quizzes";
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
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowLeft, Check, Clock, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { use } from "react";

function QuizResultSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 5 }}>
      <Box sx={{ mb: 3 }}>
        <Skeleton
          variant="rounded"
          width={160}
          height={36}
          sx={{ borderRadius: 2 }}
        />
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Question Cards Grid Skeleton (3 per row) */}
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: 1, p: 2.5, height: "100%" }}
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
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Card variant="outlined" sx={{ borderRadius: 1, p: 3 }}>
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
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <Grid key={n} size={{ xs: 2.4 }}>
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

  const questionsList = result.answers || (result as any).questions || [];
  const quizTitle = (result as any).quizTitle || "Quiz Results";

  // Statistics breakdown
  const singleChoiceQuestions = questionsList.filter(
    (q: any) => q.questionType === "SINGLE_CHOICE",
  );
  const correctSingleChoice = singleChoiceQuestions.filter(
    (q: any) => q.isCorrect === true,
  ).length;

  const multipleChoiceQuestions = questionsList.filter(
    (q: any) => q.questionType === "MULTIPLE_CHOICE",
  );
  const correctMultipleChoice = multipleChoiceQuestions.filter(
    (q: any) => q.isCorrect === true,
  ).length;

  const essayQuestions = questionsList.filter(
    (q: any) => q.questionType === "ESSAY",
  );
  const awardedEssayPoints = essayQuestions.reduce(
    (acc: number, q: any) => acc + (q.awardedPoints ?? 0),
    0,
  );
  const maxEssayPoints = essayQuestions.reduce(
    (acc: number, q: any) => acc + (q.questionPoints ?? q.points ?? 0),
    0,
  );

  const objectiveQuestions = [
    ...singleChoiceQuestions,
    ...multipleChoiceQuestions,
  ];
  const totalObjectiveCorrect = correctSingleChoice + correctMultipleChoice;

  const scrollToQuestion = (qId: string | number) => {
    const el = document.getElementById(`question-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 1 }}>
      {/* Top Header Navigation */}
      <Box sx={{ mb: 3 }}>
        <Link href={`/courses/${courseId}/quizzes`} passHref>
          <Button startIcon={<ArrowLeft size={18} />} sx={{ borderRadius: 2 }}>
            Back to Quizzes
          </Button>
        </Link>
      </Box>

      {!isGraded && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Quiz pending instructor grading
          </Typography>
          <Typography variant="body2">
            Your submission contains essay questions currently being graded by
            the instructor. Please check back later for final results.
          </Typography>
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Section: Question Cards Grid (3 per row) */}
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {quizTitle}
            </Typography>
          </Box>

          <Grid container spacing={2.5}>
            {questionsList.map((q: any, idx: number) => {
              const qId = q.questionId || idx;
              const isEssay = q.questionType === "ESSAY";
              const isCorrect = q.isCorrect;
              const questionContent = q.questionContent || q.content || "";
              const points = q.questionPoints ?? q.points ?? 0;
              const awarded = q.awardedPoints ?? 0;

              let statusBorderColor = "divider";

              if (!isEssay) {
                if (isCorrect === true) {
                  statusBorderColor = "success.main";
                } else if (isCorrect === false) {
                  statusBorderColor = "error.main";
                }
              } else if (awarded > 0) {
                statusBorderColor = "success.main";
              } else if (isGraded && awarded === 0) {
                statusBorderColor = "error.main";
              }

              return (
                <Grid
                  key={qId}
                  id={`question-${qId}`}
                  size={{ xs: 12, sm: 6, md: 4 }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 1,
                      border: 1,
                      borderColor: statusBorderColor,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 2.5,
                        display: "flex",
                        flexDirection: "column",
                        flexGrow: 1,
                      }}
                    >
                      {/* Card Header */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={`Q${idx + 1}`}
                            color="primary"
                            size="small"
                            sx={{ fontWeight: 800, height: 22 }}
                          />
                          <Chip
                            label={
                              q.questionType === "SINGLE_CHOICE"
                                ? "Single"
                                : q.questionType === "MULTIPLE_CHOICE"
                                  ? "Multiple"
                                  : "Essay"
                            }
                            variant="outlined"
                            size="small"
                            sx={{ height: 22, fontSize: "0.7rem" }}
                          />
                        </Box>

                        {/* Question Result Status Icon */}
                        {!isEssay ? (
                          isCorrect === true ? (
                            <Chip
                              icon={<Check size={14} color="#16a34a" />}
                              label="Correct"
                              color="success"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 700, height: 22 }}
                            />
                          ) : (
                            <Chip
                              icon={<X size={14} color="#dc2626" />}
                              label="Wrong"
                              color="error"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 700, height: 22 }}
                            />
                          )
                        ) : awarded > 0 ? (
                          <Chip
                            icon={<Check size={14} color="#16a34a" />}
                            label="Passed"
                            color="success"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, height: 22 }}
                          />
                        ) : (
                          <Chip
                            icon={<Clock size={14} color="#d97706" />}
                            label="Essay"
                            color="warning"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, height: 22 }}
                          />
                        )}
                      </Box>

                      {/* Question Points */}
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color:
                            awarded > 0 ? "success.main" : "text.secondary",
                          mb: 1.5,
                          display: "block",
                        }}
                      >
                        Score: {awarded} / {points} pts
                      </Typography>

                      {/* Question Text */}
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          mb: 2,
                          flexGrow: 1,
                          lineHeight: 1.5,
                        }}
                        dangerouslySetInnerHTML={{ __html: questionContent }}
                      />

                      <Divider sx={{ my: 1.5 }} />

                      {/* Options List for Single & Multiple Choice */}
                      {!isEssay && q.options && (
                        <Stack spacing={1}>
                          {q.options.map((opt: any) => {
                            const isUserSelected =
                              q.selectedOptionIds?.includes(opt.id);
                            const isCorrectOption =
                              q.correctOptionIds?.includes(opt.id) ||
                              opt.isCorrect;

                            let optionBg = "background.paper";
                            let optionBorder = "divider";
                            let textColor = "text.primary";
                            let statusIcon = null;

                            if (isCorrectOption) {
                              optionBg = "success.50";
                              optionBorder = "success.main";
                              textColor = "success.dark";
                              statusIcon = (
                                <Check
                                  size={16}
                                  color="#16a34a"
                                  style={{ flexShrink: 0 }}
                                />
                              );
                            } else if (isUserSelected && !isCorrectOption) {
                              optionBg = "error.50";
                              optionBorder = "error.main";
                              textColor = "error.dark";
                              statusIcon = (
                                <X
                                  size={16}
                                  color="#dc2626"
                                  style={{ flexShrink: 0 }}
                                />
                              );
                            }

                            return (
                              <Paper
                                key={opt.id}
                                variant="outlined"
                                sx={{
                                  p: 1.25,
                                  borderRadius: 0.5,
                                  bgcolor: optionBg,
                                  borderColor: optionBorder,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 1,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    overflow: "hidden",
                                  }}
                                >
                                  {statusIcon}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight:
                                        isCorrectOption || isUserSelected
                                          ? 700
                                          : 400,
                                      color: textColor,
                                      fontSize: "0.825rem",
                                    }}
                                  >
                                    {opt.optionText}
                                  </Typography>
                                </Box>

                                {isUserSelected && !isCorrectOption && (
                                  <Chip
                                    label="Your choice"
                                    color="error"
                                    size="small"
                                    sx={{
                                      height: 18,
                                      fontSize: "0.65rem",
                                      fontWeight: 700,
                                    }}
                                  />
                                )}
                              </Paper>
                            );
                          })}
                        </Stack>
                      )}

                      {/* Essay Section */}
                      {isEssay && (
                        <Box sx={{ mt: 1 }}>
                          <Box
                            sx={{
                              p: 1.5,
                              bgcolor: "action.hover",
                              borderRadius: 0.5,
                              mb: 1.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                              }}
                            >
                              Your answer:
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                whiteSpace: "pre-wrap",
                                fontSize: "0.825rem",
                              }}
                            >
                              {q.answerText || "(No answer provided)"}
                            </Typography>
                          </Box>

                          {q.feedback && (
                            <Alert
                              severity="info"
                              icon={<MessageSquare size={16} />}
                              sx={{ borderRadius: 2, py: 0.5, px: 1.5 }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 700, display: "block" }}
                              >
                                Instructor Feedback:
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "0.825rem" }}
                              >
                                {q.feedback}
                              </Typography>
                            </Alert>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Right Side: Sticky Result Summary Panel */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 96 } }}>
            <Card
              sx={{
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
                boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
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
                      bgcolor: percentage >= 50 ? "success.50" : "error.50",
                      borderColor:
                        percentage >= 50 ? "success.main" : "error.main",
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
                      <Typography
                        component="span"
                        variant="h6"
                        color="text.secondary"
                      >
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
                      bgcolor: "warning.50",
                      borderColor: "warning.main",
                      mb: 3,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "warning.dark" }}
                    >
                      Pending Instructor Grading
                    </Typography>
                  </Paper>
                )}

                {/* Correct Answers & Breakdown */}
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1.5 }}
                >
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
                        {correctMultipleChoice} /{" "}
                        {multipleChoiceQuestions.length}
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
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1.5 }}
                >
                  Question Matrix (Click to View)
                </Typography>

                <Grid container spacing={1}>
                  {questionsList.map((q: any, idx: number) => {
                    const qId = q.questionId || idx;
                    const isEssay = q.questionType === "ESSAY";
                    const isCorrect = q.isCorrect;
                    let btnBg = "grey.300";
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
                      <Grid key={qId} size={{ xs: 2.4, sm: 2, md: 2.4 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => scrollToQuestion(qId)}
                          sx={{
                            minWidth: 0,
                            width: "100%",
                            height: 38,
                            p: 0,
                            borderRadius: 2,
                            bgcolor: btnBg,
                            color: btnColor,
                            fontWeight: 700,
                            fontSize: "0.8rem",
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
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
