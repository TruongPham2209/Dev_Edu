"use client";

import { ColumnDef, DataTable } from "@/components/common/data-table";
import { InfoDialog } from "@/components/common/info-dialog";
import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import {
  useStartAttemptMutation,
  useStudentAttemptHistoryQuery,
} from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import type {
  QuizAssignmentResponse,
  SubmitAttemptResponse,
} from "@/lib/type/quizzes";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Award,
  Calendar,
  CalendarOff,
  Clock,
  Eye,
  Hash,
  HelpCircle,
  History,
  Play,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface QuizAssignmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  assignment: QuizAssignmentResponse | null;
  courseId: string;
  loading?: boolean;
}

function ModalSkeleton() {
  return (
    <Stack spacing={3} sx={{ pt: 1 }}>
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                textAlign: "center",
                borderRadius: 2.5,
                height: 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Skeleton
                variant="circular"
                width={20}
                height={20}
                sx={{ mb: 0.5 }}
              />
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="80%" height={24} />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
        <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" />
        <Skeleton variant="text" width="85%" />
      </Paper>
      <Box>
        <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1.5 }} />
        <Stack spacing={1.5}>
          {[1, 2].map((i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Skeleton variant="text" width="50%" height={20} />
              <Skeleton variant="text" width={120} height={16} />
            </Paper>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

export function QuizAssignmentDetailModal({
  open,
  onClose,
  assignment,
  courseId,
  loading = false,
}: QuizAssignmentDetailModalProps) {
  const router = useRouter();
  const toast = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: attemptHistory, isLoading: isLoadingHistory } =
    useStudentAttemptHistoryQuery(assignment?.id || "", {
      enabled: open && !!assignment?.id,
    });

  const startMutation = useStartAttemptMutation({
    onSuccess: (data) => {
      toast.success("Exam attempt started successfully!");
      localStorage.setItem(
        `quiz_session_token_${data.attemptId}`,
        data.activeSessionToken,
      );
      sessionStorage.setItem(
        `quiz_session_token_${data.attemptId}`,
        data.activeSessionToken,
      );
      if (assignment?.id) {
        localStorage.setItem(
          `quiz_session_token_assignment_${assignment.id}`,
          data.activeSessionToken,
        );
        sessionStorage.setItem(
          `quiz_session_token_assignment_${assignment.id}`,
          data.activeSessionToken,
        );
      }
      localStorage.setItem(
        `quiz_start_data_${data.attemptId}`,
        JSON.stringify(data),
      );
      sessionStorage.setItem(
        `quiz_start_data_${data.attemptId}`,
        JSON.stringify(data),
      );
      setConfirmOpen(false);
      onClose();
      router.push(
        `/courses/${courseId}/quizzes/${assignment?.id}/exam?attemptId=${data.attemptId}`,
      );
    },
    onError: (err) => {
      toast.error(`Failed to start attempt: ${err.message}`);
      if (assignment?.id) {
        localStorage.removeItem(
          `quiz_session_token_assignment_${assignment.id}`,
        );
        sessionStorage.removeItem(
          `quiz_session_token_assignment_${assignment.id}`,
        );
      }
    },
  });

  if (!assignment && !loading) return null;

  const submittedAttempts = attemptHistory || [];
  const attemptsCount = submittedAttempts.length;
  const maxAttempts = assignment?.maxAttempts || 1;
  const attemptsLeft = Math.max(0, maxAttempts - attemptsCount);
  const isActive = assignment?.status === "ACTIVE";
  const canAttempt = isActive && attemptsLeft > 0;

  const handleConfirmStart = () => {
    if (!assignment) return;
    const storageKey = `quiz_session_token_assignment_${assignment.id}`;
    let sessionToken =
      localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey);
    if (!sessionToken) {
      sessionToken = crypto.randomUUID
        ? crypto.randomUUID()
        : `token_${Date.now()}_${Math.random()}`;
      localStorage.setItem(storageKey, sessionToken);
      sessionStorage.setItem(storageKey, sessionToken);
    }
    startMutation.mutate({ assignmentId: assignment.id, sessionToken });
  };

  return (
    <>
      <InfoDialog
        open={open}
        onClose={onClose}
        title={
          <Box sx={{ pr: 4 }}>
            <Typography
              variant="caption"
              color="primary"
              sx={{
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              Quiz Assignment Details
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
              {assignment?.assignmentName || "Quiz Assignment"}
            </Typography>
          </Box>
        }
        headerIcon={<HelpCircle size={24} />}
        maxWidth="md"
      >
        {loading || !assignment ? (
          <ModalSkeleton />
        ) : (
          <Stack spacing={3} sx={{ pt: 1 }}>
            {/* Status & Key Stats */}
            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              {/* 1. Duration */}
              <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: "center",
                    borderRadius: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Clock
                    size={20}
                    color="#2563eb"
                    style={{ marginBottom: 4 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 500 }}
                  >
                    Duration
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {assignment.durationMinutes} Mins
                  </Typography>
                </Paper>
              </Grid>

              {/* 2. Attempts Limit */}
              <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: "center",
                    borderRadius: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Hash size={20} color="#7c3aed" style={{ marginBottom: 4 }} />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 500 }}
                  >
                    Attempts Taken
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                    }}
                  >
                    {attemptsCount} / {assignment.maxAttempts}
                  </Typography>
                </Paper>
              </Grid>

              {/* 3. Remaining */}
              <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: "center",
                    borderRadius: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Award
                    size={20}
                    color="#eab308"
                    style={{ marginBottom: 4 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 500 }}
                  >
                    Remaining Attempts
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.9rem", sm: "1rem" },
                      color: attemptsLeft > 0 ? "success.main" : "error.main",
                    }}
                  >
                    {attemptsLeft} Left
                  </Typography>
                </Paper>
              </Grid>

              {/* 4. Start Time */}
              <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: "center",
                    borderRadius: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Calendar
                    size={20}
                    color="#16a34a"
                    style={{ marginBottom: 4 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 500 }}
                  >
                    Start Time
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.825rem" },
                    }}
                  >
                    {formatServerDate(assignment.startTime, "datetime")}
                  </Typography>
                </Paper>
              </Grid>

              {/* 5. End Time */}
              <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: "center",
                    borderRadius: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CalendarOff
                    size={20}
                    color="#dc2626"
                    style={{ marginBottom: 4 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 500 }}
                  >
                    End Time
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: "0.75rem", sm: "0.825rem" },
                    }}
                  >
                    {assignment.endTime
                      ? formatServerDate(assignment.endTime, "datetime")
                      : "No Limit"}
                  </Typography>
                </Paper>
              </Grid>

              {/* 6. Status */}
              <Grid size={{ xs: 6, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: "center",
                    borderRadius: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <HelpCircle
                    size={20}
                    color="#0284c7"
                    style={{ marginBottom: 4 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", fontWeight: 500 }}
                  >
                    Assignment Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <QuizStatusChip status={assignment.status} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>

            {/* Instructions & Guidelines */}
            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "action.hover" }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                Instructions & Regulations
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <b>Single Active Session:</b> Do not open the quiz in multiple
                tabs or devices simultaneously.
                <br />• <b>Autosave:</b> Answers are synchronized automatically
                to the server.
                <br />• <b>Timer:</b> When the countdown reaches 00:00, your
                test will be submitted automatically.
              </Typography>
            </Paper>

            {/* Attempt History Section */}
            <Box sx={{ mt: 1, width: "100%" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <History size={18} color="#2563eb" />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Submitted Attempt History ({submittedAttempts.length})
                </Typography>
              </Box>

              {isLoadingHistory ? (
                <Skeleton
                  variant="rounded"
                  height={100}
                  sx={{ borderRadius: 2 }}
                />
              ) : submittedAttempts.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", py: 1 }}
                >
                  No previous submitted attempts found for this assignment.
                </Typography>
              ) : (
                (() => {
                  const attemptColumns: ColumnDef<SubmitAttemptResponse>[] = [
                    {
                      header: "Attempt",
                      width: "70px",
                      render: (attempt) => (
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          #{attempt.attemptNumber ?? "-"}
                        </Typography>
                      ),
                    },
                    {
                      header: "Submitted At",
                      width: "140px",
                      render: (attempt) => (
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.825rem" }}
                        >
                          {attempt.submittedAt
                            ? formatServerDate(attempt.submittedAt, "datetime")
                            : "Submitting..."}
                        </Typography>
                      ),
                    },
                    {
                      header: "Status",
                      width: "120px",
                      render: (attempt) => (
                        <QuizStatusChip status={attempt.status} />
                      ),
                    },
                    {
                      header: "Score",
                      width: "100px",
                      align: "center",
                      render: (attempt) =>
                        attempt.totalScore != null ? (
                          <Chip
                            label={`${attempt.totalScore} / ${attempt.maxScore}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              height: 22,
                              fontSize: "0.75rem",
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Pending Grading
                          </Typography>
                        ),
                    },
                    {
                      header: "Action",
                      width: "120px",
                      align: "right",
                      render: (attempt) => (
                        <Link
                          href={`/courses/${courseId}/quizzes/attempts/${attempt.attemptId}/result`}
                          passHref
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Eye size={14} />}
                            sx={{
                              borderRadius: 1.5,
                              textTransform: "none",
                              py: 0.25,
                              fontSize: "0.775rem",
                              whiteSpace: "nowrap",
                            }}
                          >
                            View Result
                          </Button>
                        </Link>
                      ),
                    },
                  ];

                  return (
                    <DataTable
                      columns={attemptColumns}
                      data={submittedAttempts}
                      keyExtractor={(item) => item.attemptId}
                      minWidth={550}
                    />
                  );
                })()
              )}
            </Box>

            {!isActive && assignment && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                {assignment.status === "SCHEDULED"
                  ? "This quiz assignment is scheduled and has not opened yet. You can only start when the status is Active."
                  : "This quiz assignment is closed. Submissions are no longer accepted."}
              </Alert>
            )}

            {/* Action Footer */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 2,
                pt: 2,
                borderTop: 1,
                borderColor: "divider",
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={
                  attemptsCount > 0 ? (
                    <RotateCcw size={18} />
                  ) : (
                    <Play size={18} />
                  )
                }
                disabled={!canAttempt}
                onClick={() => setConfirmOpen(true)}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  fontWeight: 700,
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {!canAttempt && attemptsCount >= maxAttempts
                  ? "No Attempts Remaining"
                  : attemptsCount > 0
                    ? "Retake / Resume Quiz"
                    : "Start Attempt"}
              </Button>
            </Box>
          </Stack>
        )}
      </InfoDialog>

      {/* Confirmation Dialog */}
      <InfoDialog
        open={confirmOpen}
        onClose={() => !startMutation.isPending && setConfirmOpen(false)}
        title="Confirm Start Quiz"
        headerIcon={<ShieldAlert size={22} color="#0284c7" />}
        maxWidth="xs"
      >
        <Box sx={{ textAlign: "center", py: { xs: 0.5, sm: 1 } }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: "0.875rem", sm: "0.95rem" } }}
          >
            Are you sure you want to start the quiz{" "}
            <b>&quot;{assignment?.assignmentName || "Quiz Assignment"}&quot;</b>?
          </Typography>
          <Alert
            severity="info"
            icon={<ShieldAlert size={18} />}
            sx={{
              mt: 2,
              borderRadius: 2,
              textAlign: "left",
              fontSize: { xs: "0.8rem", sm: "0.85rem" },
            }}
          >
            Timer ({assignment?.durationMinutes} mins) will begin immediately
            upon confirmation.
          </Alert>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column-reverse", sm: "row" },
              justifyContent: "flex-end",
              gap: { xs: 1, sm: 1.5 },
              mt: 3,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setConfirmOpen(false)}
              disabled={startMutation.isPending}
              sx={{
                borderRadius: 2,
                width: { xs: "100%", sm: "auto" },
                fontWeight: 600,
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleConfirmStart}
              disabled={startMutation.isPending}
              startIcon={
                startMutation.isPending ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Play size={16} />
                )
              }
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 700,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {startMutation.isPending ? "Starting Quiz..." : "Yes, Start Quiz"}
            </Button>
          </Box>
        </Box>
      </InfoDialog>
    </>
  );
}
