"use client";

import { ExamAutosaveIndicator } from "@/app/(student)/courses/[id]/quizzes/[assignmentId]/exam/exam-autosave-indicator";
import { ExamQuestionNav } from "@/app/(student)/courses/[id]/quizzes/[assignmentId]/exam/exam-question-nav";
import { ExamTimer } from "@/app/(student)/courses/[id]/quizzes/[assignmentId]/exam/exam-timer";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { SessionLockDialog } from "@/components/dialog/quiz/session-lock-dialog";
import { useQuizExamSession } from "@/hooks/use-quiz-exam-session";
import { useAttemptQuery, useSubmitAttemptMutation } from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import type { StartAttemptResponse } from "@/lib/type/quizzes";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Divider,
  Drawer,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { ArrowLeft, ArrowRight, LayoutGrid, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useMemo, useState } from "react";

export default function CourseStudentExamRoomPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>;
}) {
  const { id: courseId, assignmentId } = use(params);
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId") || "";
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState<boolean>(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);

  const { data: latestAttemptData, isLoading: isAttemptLoading } =
    useAttemptQuery(attemptId);

  const fallbackStartData = useMemo(() => {
    if (typeof window === "undefined" || !attemptId) return null;
    const raw =
      localStorage.getItem(`quiz_start_data_${attemptId}`) ||
      sessionStorage.getItem(`quiz_start_data_${attemptId}`);
    if (raw) {
      try {
        return JSON.parse(raw) as StartAttemptResponse;
      } catch (e) {
        console.error("Failed to parse start data", e);
      }
    }
    return null;
  }, [attemptId]);

  const startData = latestAttemptData || fallbackStartData;

  const submitMutation = useSubmitAttemptMutation({
    onSuccess: (data) => {
      toast.success("Submit attempt successfully!");
      localStorage.removeItem(`quiz_session_token_${data.attemptId}`);
      sessionStorage.removeItem(`quiz_session_token_${data.attemptId}`);
      localStorage.removeItem(`quiz_start_data_${data.attemptId}`);
      sessionStorage.removeItem(`quiz_start_data_${data.attemptId}`);
      if (assignmentId) {
        localStorage.removeItem(
          `quiz_session_token_assignment_${assignmentId}`,
        );
        sessionStorage.removeItem(
          `quiz_session_token_assignment_${assignmentId}`,
        );
      }
      router.push(
        `/courses/${courseId}/quizzes/attempts/${data.attemptId}/result`,
      );
    },
    onError: (err) => {
      toast.error(`Error submitting attempt: ${err.message}`);
    },
  });

  const handleFinalSubmit = () => {
    if (!attemptId) return;
    submitMutation.mutate(attemptId);
  };

  const {
    isSessionLocked,
    sessionLockMessage,
    timeRemaining,
    answersMap,
    autosaveState,
    updateSingleChoice,
    updateMultipleChoice,
    updateEssayAnswer,
  } = useQuizExamSession({
    attemptId,
    expiresAt: startData?.expiresAt || "",
    initialAnswers: startData?.existingAnswers,
    activeSessionToken: startData?.activeSessionToken,
    onSubmit: handleFinalSubmit,
  });

  if (!attemptId || isAttemptLoading || !startData) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 1 }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3, md: 4 }, py: { xs: 1.5, sm: 2 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1,
              mb: 2,
            }}
          >
            <Skeleton
              variant="rounded"
              width={140}
              height={36}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton
              variant="rounded"
              width={220}
              height={36}
              sx={{ borderRadius: 9999, display: { xs: "block", md: "none" } }}
            />
          </Box>

          <Grid container spacing={{ xs: 2.5, md: 4 }}>
            {/* Left Question Card Skeleton */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                sx={{
                  borderRadius: { xs: 2, sm: 3 },
                  border: 1,
                  borderColor: "divider",
                  minHeight: { xs: 350, sm: 450 },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3.5 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: { xs: 1, sm: 1.5 },
                      mb: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.5}>
                      <Skeleton
                        variant="rounded"
                        width={110}
                        height={32}
                        sx={{ borderRadius: 2 }}
                      />
                      <Skeleton
                        variant="rounded"
                        width={90}
                        height={32}
                        sx={{ borderRadius: 2 }}
                      />
                    </Stack>
                    <Skeleton variant="text" width={70} height={24} />
                  </Box>
                  <Divider sx={{ mb: 2.5 }} />
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={28}
                    sx={{ mb: 1 }}
                  />
                  <Skeleton
                    variant="text"
                    width="70%"
                    height={28}
                    sx={{ mb: 4 }}
                  />

                  <Stack spacing={2} sx={{ mb: 4 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton
                        key={i}
                        variant="rounded"
                        height={56}
                        sx={{ borderRadius: 1.5 }}
                      />
                    ))}
                  </Stack>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      pt: 3,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Skeleton
                      variant="rounded"
                      width={100}
                      height={40}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="rounded"
                      width={100}
                      height={40}
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Sticky Question Nav Skeleton */}
            <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: "none", md: "block" } }}>
              <Box
                sx={{
                  position: "sticky",
                  top: "96px",
                  maxHeight: "calc(100vh - 130px)",
                  overflowY: "auto",
                  pr: 0.5,
                  "&::-webkit-scrollbar": { width: 4 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "divider",
                    borderRadius: 2,
                  },
                }}
              >
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: 1,
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton
                      variant="rounded"
                      width={70}
                      height={24}
                      sx={{ borderRadius: 2 }}
                    />
                  </Box>
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={18}
                    sx={{ mb: 2 }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={44}
                    sx={{ borderRadius: 2.5, mb: 2.5 }}
                  />
                  <Divider sx={{ mb: 2.5 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 2,
                    }}
                  >
                    <Skeleton variant="text" width={100} height={20} />
                    <Skeleton variant="text" width={80} height={18} />
                  </Box>
                  <Grid container spacing={1.5} sx={{ mb: 3 }}>
                    {[...Array(9)].map((_, i) => (
                      <Grid key={i} size={{ xs: 4 }}>
                        <Skeleton
                          variant="rounded"
                          height={40}
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      pt: 2,
                      borderTop: 1,
                      borderColor: "divider",
                      mb: 2.5,
                    }}
                  >
                    <Skeleton variant="text" width={80} height={16} />
                    <Skeleton variant="text" width={80} height={16} />
                  </Stack>
                  <Skeleton
                    variant="rounded"
                    height={48}
                    sx={{ borderRadius: 2.5 }}
                  />
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (startData.status !== "IN_PROGRESS") {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{ p: 5, textAlign: "center", borderRadius: 4 }}
        >
          <Alert severity="info" sx={{ mb: 3, justifyContent: "center" }}>
            This quiz has already been submitted or ended. You cannot continue
            editing the test.
          </Alert>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Quiz status: {startData.status}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() =>
              router.push(
                `/courses/${courseId}/quizzes/attempts/${attemptId}/result`,
              )
            }
            sx={{ borderRadius: 2, px: 4 }}
          >
            View quiz results
          </Button>
        </Paper>
      </Container>
    );
  }

  const questions = startData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answersMap[currentQuestion?.id] || {};

  const answeredCount = questions.filter((q) => {
    const ans = answersMap[q.id];
    if (!ans) return false;
    if (q.questionType === "ESSAY") return !!ans.answerText?.trim();
    return !!ans.selectedOptionIds && ans.selectedOptionIds.length > 0;
  }).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 1 }}>
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3, md: 4 }, py: { xs: 1.5, sm: 2 } }}>
        {/* Back to Quizzes Button & Mobile Sticky Header Bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mb: 2,
          }}
        >
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => setIsExitModalOpen(true)}
            sx={{ borderRadius: 2 }}
          >
            Back to Quizzes
          </Button>

          {/* Mobile & Tablet Action Bar (< md) */}
          <Paper
            elevation={0}
            sx={{
              display: { xs: "flex", md: "none" },
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
            <ExamTimer timeRemainingSeconds={timeRemaining} compact />
            <ExamAutosaveIndicator state={autosaveState} />
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={() => setIsNavDrawerOpen(true)}
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
              Matrix ({answeredCount}/{questions.length})
            </Button>
          </Paper>
        </Box>

        <Grid container spacing={{ xs: 2.5, md: 4 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            {currentQuestion && (
              <Card
                sx={{
                  borderRadius: { xs: 2, sm: 3 },
                  border: 1,
                  borderColor: "divider",
                  minHeight: { xs: 350, sm: 450 },
                }}
              >
                <CardContent sx={{ p: { xs: 2, sm: 3.5 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: { xs: 1, sm: 1.5 },
                      mb: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: 1.5,
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Chip
                        label={`Question ${currentQuestionIndex + 1}`}
                        color="primary"
                        sx={{ fontWeight: 700 }}
                      />
                      <Chip
                        label={
                          currentQuestion.questionType === "SINGLE_CHOICE"
                            ? "Single choice"
                            : currentQuestion.questionType === "MULTIPLE_CHOICE"
                              ? "Multiple choice"
                              : "Essay"
                        }
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "text.secondary" }}
                    >
                      ({currentQuestion.points} points)
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2.5 }} />

                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 3, lineHeight: 1.6, fontSize: { xs: "1rem", sm: "1.25rem" } }}
                    dangerouslySetInnerHTML={{
                      __html: currentQuestion.content,
                    }}
                  />

                  {currentQuestion.questionType === "SINGLE_CHOICE" && (
                    <RadioGroup
                      value={currentAnswer.selectedOptionIds?.[0] || ""}
                      onChange={(e) =>
                        updateSingleChoice(currentQuestion.id, e.target.value)
                      }
                    >
                      <Stack spacing={2}>
                        {currentQuestion.options?.map((opt) => {
                          const selected =
                            currentAnswer.selectedOptionIds?.includes(opt.id);

                          return (
                            <Paper
                              key={opt.id}
                              variant="outlined"
                              onClick={() =>
                                updateSingleChoice(currentQuestion.id, opt.id)
                              }
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                cursor: "pointer",
                                border: 1,
                                borderColor: selected
                                  ? "primary.main"
                                  : "divider",
                                bgcolor: selected
                                  ? (theme) =>
                                    alpha(
                                      theme.palette.primary.main,
                                      theme.palette.mode === "dark"
                                        ? 0.18
                                        : 0.08,
                                    )
                                  : "background.paper",
                                "&:hover": {
                                  bgcolor: selected
                                    ? (theme) =>
                                      alpha(
                                        theme.palette.primary.main,
                                        theme.palette.mode === "dark"
                                          ? 0.22
                                          : 0.12,
                                      )
                                    : "action.hover",
                                },
                              }}
                            >
                              <FormControlLabel
                                value={opt.id}
                                control={
                                  <Radio checked={!!selected} color="primary" />
                                }
                                label={
                                  <Typography
                                    variant="body1"
                                    sx={{ fontWeight: selected ? 700 : 400 }}
                                  >
                                    {opt.optionText}
                                  </Typography>
                                }
                                sx={{ width: "100%", m: 0 }}
                              />
                            </Paper>
                          );
                        })}
                      </Stack>
                    </RadioGroup>
                  )}

                  {currentQuestion.questionType === "MULTIPLE_CHOICE" && (
                    <Stack spacing={2}>
                      {currentQuestion.options?.map((opt) => {
                        const selected =
                          currentAnswer.selectedOptionIds?.includes(opt.id);

                        return (
                          <Paper
                            key={opt.id}
                            variant="outlined"
                            onClick={() =>
                              updateMultipleChoice(currentQuestion.id, opt.id)
                            }
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              cursor: "pointer",
                              border: 1,
                              borderColor: selected
                                ? "primary.main"
                                : "divider",
                              bgcolor: selected
                                ? (theme) =>
                                  alpha(
                                    theme.palette.primary.main,
                                    theme.palette.mode === "dark"
                                      ? 0.18
                                      : 0.08,
                                  )
                                : "background.paper",
                              "&:hover": {
                                bgcolor: selected
                                  ? (theme) =>
                                    alpha(
                                      theme.palette.primary.main,
                                      theme.palette.mode === "dark"
                                        ? 0.22
                                        : 0.12,
                                    )
                                  : "action.hover",
                              },
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={!!selected}
                                  onChange={() =>
                                    updateMultipleChoice(
                                      currentQuestion.id,
                                      opt.id,
                                    )
                                  }
                                  color="primary"
                                />
                              }
                              label={
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: selected ? 700 : 400 }}
                                >
                                  {opt.optionText}
                                </Typography>
                              }
                              sx={{ width: "100%", m: 0 }}
                            />
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}

                  {currentQuestion.questionType === "ESSAY" && (
                    <Box>
                      <FormInput
                        label="Your essay answer *"
                        multiline
                        minRows={8}
                        value={currentAnswer.answerText || ""}
                        onChange={(e) =>
                          updateEssayAnswer(currentQuestion.id, e.target.value)
                        }
                        placeholder="Enter your essay answer here..."
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Character count:{" "}
                        {(currentAnswer.answerText || "").length}
                      </Typography>
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "space-between",
                      mt: 4,
                      pt: 3,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<ArrowLeft size={18} />}
                      disabled={currentQuestionIndex === 0}
                      onClick={() =>
                        setCurrentQuestionIndex((prev) => prev - 1)
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      Previous
                    </Button>

                    <Button
                      variant="contained"
                      endIcon={<ArrowRight size={18} />}
                      disabled={currentQuestionIndex === questions.length - 1}
                      onClick={() =>
                        setCurrentQuestionIndex((prev) => prev + 1)
                      }
                      sx={{ borderRadius: 2 }}
                    >
                      Next
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Desktop Question Nav (md and above) */}
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: { xs: "none", md: "block" } }}>
            <Box
              sx={{
                position: "sticky",
                top: "110px",
                maxHeight: "calc(100vh - 130px)",
                overflowY: "auto",
                pr: 0.5,
                "&::-webkit-scrollbar": { width: 4 },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: "divider",
                  borderRadius: 2,
                },
              }}
            >
              <ExamQuestionNav
                questions={questions}
                currentIndex={currentQuestionIndex}
                answersMap={answersMap}
                onSelectQuestion={setCurrentQuestionIndex}
                quizTitle={startData.quizTitle}
                attemptNumber={startData.attemptNumber}
                autosaveState={autosaveState}
                timeRemainingSeconds={timeRemaining}
                onSubmitClick={() => setIsSubmitModalOpen(true)}
                submitPending={submitMutation.isPending}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Mobile/Tablet Question Nav Bottom Sheet Drawer */}
      <Drawer
        anchor="bottom"
        open={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
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
            Question Matrix ({answeredCount}/{questions.length})
          </Typography>
          <IconButton onClick={() => setIsNavDrawerOpen(false)} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ p: 2, overflowY: "auto", flex: 1 }}>
          <ExamQuestionNav
            questions={questions}
            currentIndex={currentQuestionIndex}
            answersMap={answersMap}
            onSelectQuestion={(idx) => {
              setCurrentQuestionIndex(idx);
              setIsNavDrawerOpen(false);
            }}
            quizTitle={startData.quizTitle}
            attemptNumber={startData.attemptNumber}
            autosaveState={autosaveState}
            timeRemainingSeconds={timeRemaining}
            onSubmitClick={() => {
              setIsNavDrawerOpen(false);
              setIsSubmitModalOpen(true);
            }}
            submitPending={submitMutation.isPending}
          />
        </Box>
      </Drawer>

      <SessionLockDialog open={isSessionLocked} message={sessionLockMessage} />

      <ConfirmDialog
        open={isSubmitModalOpen}
        title="Confirm submit quiz?"
        description={
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              You have completed <b>{answeredCount}</b> out of{" "}
              <b>{questions.length}</b> questions.
            </Typography>
            {answeredCount < questions.length && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                There are <b>{questions.length - answeredCount}</b> questions
                that have not been answered!
              </Alert>
            )}
          </Stack>
        }
        confirmLabel="Submit"
        cancelLabel="Cancel"
        confirmColor="primary"
        isLoading={submitMutation.isPending}
        onConfirm={handleFinalSubmit}
        onCancel={() => setIsSubmitModalOpen(false)}
      />

      <ConfirmDialog
        open={isExitModalOpen}
        title="Leave exam room?"
        description="Are you sure you want to leave the exam room? Your answers are automatically saved, and you can resume the test as long as the attempt has not expired."
        confirmLabel="Leave Exam"
        cancelLabel="Stay in Exam"
        confirmColor="warning"
        onConfirm={() => {
          setIsExitModalOpen(false);
          router.push(`/courses/${courseId}/quizzes`);
        }}
        onCancel={() => setIsExitModalOpen(false)}
      />
    </Box>
  );
}
