"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { FormInput } from "@/components/common/form/form-input";
import { InfoDialog } from "@/components/common/info-dialog";
import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import {
  useQuizByIdQuery,
  useReviewQuizMutation,
  useSubmitQuizMutation,
} from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import type { QuizResponse, QuizStatus } from "@/lib/type/quizzes";
import { formatServerDate } from "@/lib/util/date-utils";
import { validateQuizForSubmit } from "@/lib/util/quiz-utils";
import {
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Edit,
  FileQuestion,
  GraduationCap,
  HelpCircle,
  Send,
  User,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface QuizDetailDialogProps {
  open: boolean;
  onClose: () => void;
  quiz: QuizResponse | null;
  role?: "ADMIN" | "LECTURER";
  onStatusChange?: () => void;
}

export function QuizDetailDialog({
  open,
  onClose,
  quiz,
  role = "LECTURER",
  onStatusChange,
}: QuizDetailDialogProps) {
  const toast = useToast();
  const router = useRouter();

  // Confirmation & moderation modal state
  const [moderationTarget, setModerationTarget] = useState<{
    quiz: QuizResponse;
    type: "approve" | "reject";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState<QuizStatus | null>(null);

  // Reset overrideStatus when modal opens or quiz changes
  useEffect(() => {
    setOverrideStatus(null);
  }, [quiz?.id, open]);

  // Fetch full details when open
  const {
    data: fetchedQuizDetail,
    isLoading,
    isError,
    refetch,
  } = useQuizByIdQuery(quiz?.id ?? "", {
    enabled: open && !!quiz?.id,
  });

  // Normalize quizDetail from QuizDetailResponse
  const realQuiz = fetchedQuizDetail?.quiz || quiz;
  const typeConfigs =
    fetchedQuizDetail?.typeConfigs || quiz?.typeConfigs || [];
  const questions =
    fetchedQuizDetail?.questions || quiz?.questions || [];

  const quizDetail: QuizResponse | null = realQuiz
    ? {
        ...quiz,
        ...realQuiz,
        status: overrideStatus || realQuiz.status || quiz?.status || "DRAFT",
        typeConfigs:
          typeConfigs.length > 0 ? typeConfigs : realQuiz?.typeConfigs || [],
        questions: questions.length > 0 ? questions : realQuiz?.questions || [],
      }
    : quiz;

  const quizTitle = quizDetail?.title || quiz?.title || "";

  // Mutations
  const reviewMutation = useReviewQuizMutation({
    onSuccess: (_, variables) => {
      const newStatus: QuizStatus = variables.review.approved
        ? "APPROVED"
        : "REJECTED";
      setOverrideStatus(newStatus);
      if (variables.review.approved) {
        toast.success("Approved quiz successfully!");
      } else {
        toast.success("Rejected quiz successfully!");
      }
      setModerationTarget(null);
      setRejectionReason("");
      refetch();
      onStatusChange?.();
    },
    onError: (err) => {
      toast.error(`Approval action failed: ${err.message}`);
    },
  });

  const submitMutation = useSubmitQuizMutation({
    onSuccess: () => {
      setOverrideStatus("PENDING");
      toast.success("Submitted quiz for approval successfully!");
      setShowSubmitConfirm(false);
      refetch();
      onStatusChange?.();
    },
    onError: (err) => {
      toast.error(`Submit failed: ${err.message}`);
    },
  });

  if (!quiz) return null;

  // Handlers for Admin Moderation
  const handleOpenApprove = () => {
    if (!quizDetail) return;
    setRejectionReason("");
    setModerationTarget({ quiz: quizDetail, type: "approve" });
  };

  const handleOpenReject = () => {
    if (!quizDetail) return;
    setRejectionReason("");
    setModerationTarget({ quiz: quizDetail, type: "reject" });
  };

  const handleConfirmModeration = async () => {
    if (!moderationTarget) return;

    if (moderationTarget.type === "approve") {
      await reviewMutation.mutateAsync({
        quizId: moderationTarget.quiz.id,
        review: { approved: true },
      });
    } else {
      if (!rejectionReason.trim()) {
        toast.error("Please enter a rejection reason");
        return;
      }
      await reviewMutation.mutateAsync({
        quizId: moderationTarget.quiz.id,
        review: { approved: false, rejectionReason: rejectionReason.trim() },
      });
    }
  };

  // Handlers for Lecturer Submit -> Open Confirm Dialog FIRST
  const handleSubmitClick = () => {
    setShowSubmitConfirm(true);
  };

  // Handler when user confirms Submit in Confirm Dialog -> Validate THEN submit
  const handleConfirmSubmit = async () => {
    if (!quizDetail) return;

    const validation = validateQuizForSubmit(quizDetail);
    if (!validation.isValid) {
      toast.error(validation.errorMessage || "Quiz configuration is invalid!");
      return;
    }

    await submitMutation.mutateAsync(quizDetail.id);
  };

  const isPendingAction = reviewMutation.isPending || submitMutation.isPending;

  return (
    <>
      <InfoDialog
        open={open}
        onClose={isPendingAction ? () => {} : onClose}
        title={quizTitle || "Quiz Detail"}
        headerIcon={<FileQuestion size={24} />}
        closeText="Close"
        maxWidth="md"
      >
        {isLoading ? (
          /* Loading Skeleton - Realistic structure to prevent layout shift */
          <Stack spacing={3} sx={{ py: 1 }}>
            {/* Top Banner Skeleton */}
            <Skeleton
              variant="rounded"
              height={56}
              sx={{ borderRadius: 1.5 }}
            />

            {/* Action Bar Skeleton */}
            <Skeleton variant="rounded" height={52} sx={{ borderRadius: 2 }} />

            {/* Description Skeleton */}
            <Box>
              <Skeleton width={140} height={24} sx={{ mb: 1 }} />
              <Skeleton width="100%" height={20} />
              <Skeleton width="60%" height={20} />
            </Box>

            {/* Matrix Config Skeleton */}
            <Box>
              <Skeleton width={180} height={24} sx={{ mb: 1.5 }} />
              <Stack spacing={1}>
                <Skeleton
                  variant="rounded"
                  height={50}
                  sx={{ borderRadius: 2 }}
                />
                <Skeleton
                  variant="rounded"
                  height={50}
                  sx={{ borderRadius: 2 }}
                />
              </Stack>
            </Box>

            {/* Questions List Skeleton */}
            <Box>
              <Skeleton width={200} height={24} sx={{ mb: 1.5 }} />
              <Stack spacing={2}>
                <Skeleton
                  variant="rounded"
                  height={120}
                  sx={{ borderRadius: 2 }}
                />
                <Skeleton
                  variant="rounded"
                  height={120}
                  sx={{ borderRadius: 2 }}
                />
              </Stack>
            </Box>
          </Stack>
        ) : isError && !fetchedQuizDetail ? (
          /* Error State with Retry Button */
          <ErrorState
            title="Failed to load quiz details"
            subtitle="An error occurred while fetching quiz details from the server."
            onRetry={() => refetch()}
          />
        ) : quizDetail ? (
          /* Main Content */
          <Stack spacing={3} sx={{ position: "relative" }}>
            {/* 1. Top Banner & Status (BEAUTIFIED METADATA CARD) */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                background:
                  "linear-gradient(135deg, rgba(241,245,249,0.8) 0%, rgba(248,250,252,0.95) 100%)",
                borderColor: "rgba(15,23,42,0.08)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                useFlexGap
                sx={{ flexWrap: "wrap", alignItems: "center" }}
              >
                {quizDetail.courseTitle && (
                  <Chip
                    icon={<BookOpen size={14} />}
                    label={quizDetail.courseTitle}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      fontSize: "0.78rem",
                      py: 0.5,
                      px: 0.5,
                    }}
                  />
                )}

                <Chip
                  icon={<User size={13} />}
                  label={quizDetail.createdBy || "Lecturer"}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    borderColor: "rgba(15,23,42,0.12)",
                  }}
                />

                <Chip
                  icon={<CalendarDays size={13} />}
                  label={formatServerDate(quizDetail.createdAt)}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    borderColor: "rgba(15,23,42,0.12)",
                  }}
                />
              </Stack>

              <QuizStatusChip status={quizDetail.status} />
            </Paper>

            {/* 2. LECTURER ROLE ACTIONS (AT TOP & STICKY TOP: 0) */}
            {role === "LECTURER" && (
              <Paper
                variant="outlined"
                sx={{
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: "background.paper",
                  borderColor: "rgba(0,0,0,0.12)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  useFlexGap
                  sx={{
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Edit size={16} />}
                    onClick={() => {
                      onClose();
                      router.push(
                        `/lecturer/courses/${quizDetail.courseId}/quizzes/${quizDetail.id}`,
                      );
                    }}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Edit
                  </Button>

                  {quizDetail.status === "APPROVED" && (
                    <>
                      <Button
                        variant="outlined"
                        color="info"
                        startIcon={<Calendar size={16} />}
                        onClick={() => {
                          onClose();
                          router.push(
                            `/lecturer/courses/${quizDetail.courseId}/quizzes/${quizDetail.id}/assignments`,
                          );
                        }}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        Manage Assignments
                      </Button>

                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<GraduationCap size={16} />}
                        onClick={() => {
                          onClose();
                          router.push(
                            `/lecturer/courses/${quizDetail.courseId}/quizzes/${quizDetail.id}/grading`,
                          );
                        }}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        Manage Grading
                      </Button>
                    </>
                  )}

                  {quizDetail.status === "DRAFT" && (
                    <Button
                      variant="contained"
                      color="warning"
                      startIcon={<Send size={16} />}
                      disabled={isPendingAction}
                      onClick={handleSubmitClick}
                      sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                      Submit
                    </Button>
                  )}
                </Stack>
              </Paper>
            )}

            {/* 3. Description */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {quizDetail.description || "No description."}
              </Typography>
            </Box>

            {/* 4. Matrix Type Configs */}
            {quizDetail.typeConfigs && quizDetail.typeConfigs.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, mb: 1.5 }}
                >
                  Matrix Configuration ({quizDetail.typeConfigs.length} question
                  types)
                </Typography>
                <Stack spacing={1}>
                  {quizDetail.typeConfigs.map((cfg) => (
                    <Paper
                      key={cfg.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {cfg.questionType}: {cfg.requiredCount} questions (
                        {cfg.pointsPerQuestion} pts/question)
                      </Typography>
                      <Chip
                        label={`Grading: ${cfg.scoringMethod === "AUTO" ? "Auto" : "Manual"}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: "0.75rem", fontWeight: 600 }}
                      />
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {/* 5. Question List */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                Questions List ({quizDetail.questions?.length || 0} questions)
              </Typography>

              {!quizDetail.questions || quizDetail.questions.length === 0 ? (
                <Paper
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
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <HelpCircle
                      size={20}
                      style={{ color: "#94a3b8", flexShrink: 0 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      This quiz has no direct questions created (or will be
                      automatically generated from question bank).
                    </Typography>
                  </Box>
                </Paper>
              ) : (
                <Stack spacing={2}>
                  {quizDetail.questions.map((q, i) => (
                    <Paper
                      key={q.id}
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
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: "primary.main" }}
                        >
                          Question {i + 1} ({q.questionType})
                        </Typography>
                        <Chip
                          label={`${q.points} pts`}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{
                            fontWeight: 700,
                            height: 22,
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>

                      <Typography
                        variant="body2"
                        dangerouslySetInnerHTML={{ __html: q.content }}
                        sx={{ mb: 1.5 }}
                      />

                      {q.options && q.options.length > 0 && (
                        <Stack spacing={0.5}>
                          {q.options.map((opt) => (
                            <Box
                              key={opt.id}
                              sx={{
                                px: 1.5,
                                py: 1,
                                borderRadius: 1.5,
                                fontSize: "0.85rem",
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
                              {opt.isCorrect ? "✓ " : "• "} {opt.optionText}
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            {/* 6. ADMIN ROLE ACTIONS (AT BOTTOM & STICKY BOTTOM: 0 - ONLY WHEN PENDING) */}
            {role === "ADMIN" && quizDetail.status === "PENDING" && (
              <Paper
                variant="outlined"
                sx={{
                  position: "sticky",
                  bottom: 0,
                  zIndex: 10,
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: "background.paper",
                  borderColor: "rgba(0,0,0,0.12)",
                  boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  useFlexGap
                  sx={{
                    flexWrap: "wrap",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle2 size={16} />}
                    disabled={isPendingAction}
                    onClick={handleOpenApprove}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<XCircle size={16} />}
                    disabled={isPendingAction}
                    onClick={handleOpenReject}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Reject
                  </Button>
                </Stack>
              </Paper>
            )}
          </Stack>
        ) : null}
      </InfoDialog>

      {/* Admin Moderation Confirm Dialog */}
      <ConfirmDialog
        open={!!moderationTarget}
        title={
          moderationTarget?.type === "approve"
            ? `Approve Quiz "${moderationTarget?.quiz?.title || quizTitle}"`
            : `Reject Quiz "${moderationTarget?.quiz?.title || quizTitle}"`
        }
        confirmLabel={
          moderationTarget?.type === "approve" ? "Approve" : "Reject"
        }
        cancelLabel="Cancel"
        confirmColor={
          moderationTarget?.type === "approve" ? "success" : "error"
        }
        isLoading={reviewMutation.isPending}
        onCancel={() => {
          if (reviewMutation.isPending) return;
          setModerationTarget(null);
          setRejectionReason("");
        }}
        onConfirm={handleConfirmModeration}
        description={
          moderationTarget && (
            <Box sx={{ pt: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  mb: moderationTarget.type === "reject" ? 2 : 0,
                  color: "text.secondary",
                }}
              >
                Are you sure you want to{" "}
                {moderationTarget.type === "approve" ? "approve" : "reject"} the
                quiz{" "}
                <Typography
                  component="span"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  &quot;{moderationTarget.quiz?.title || quizTitle}&quot;
                </Typography>
                ?
              </Typography>

              {moderationTarget.type === "reject" && (
                <FormInput
                  label="Rejection reason *"
                  multiline
                  minRows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="E.g., Please add more multiple-choice questions..."
                  error={!rejectionReason.trim()}
                  helperText={
                    !rejectionReason.trim()
                      ? "Please enter a rejection reason"
                      : undefined
                  }
                />
              )}
            </Box>
          )
        }
      />

      {/* Lecturer Submit Confirmation Dialog */}
      <ConfirmDialog
        open={showSubmitConfirm}
        title={`Submit Quiz "${quizTitle}"`}
        confirmLabel="Submit"
        cancelLabel="Cancel"
        confirmColor="warning"
        isLoading={submitMutation.isPending}
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirm={handleConfirmSubmit}
        description={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Are you sure you want to submit the quiz{" "}
            <Typography
              component="span"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              &quot;{quizTitle}&quot;
            </Typography>{" "}
            for approval? After submission, you will not be able to edit the
            quiz until you receive a response.
          </Typography>
        }
      />
    </>
  );
}
