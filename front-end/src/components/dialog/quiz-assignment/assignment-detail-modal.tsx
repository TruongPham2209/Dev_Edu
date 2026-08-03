"use client";

import { InfoDialog } from "@/components/common/info-dialog";
import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import { useStartAttemptMutation } from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import type { QuizAssignmentResponse } from "@/lib/type/quizzes";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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

  const startMutation = useStartAttemptMutation({
    onSuccess: (data) => {
      toast.success("Exam attempt started successfully!");
      sessionStorage.setItem(
        `quiz_session_token_${data.attemptId}`,
        data.activeSessionToken,
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
    },
  });

  if (!assignment && !loading) return null;

  const attemptsCount = (assignment as any)?.attemptsCount || 0;
  const maxAttempts = assignment?.maxAttempts || 1;
  const attemptsLeft = maxAttempts - attemptsCount;
  const isActive = assignment?.status === "ACTIVE";
  const canAttempt = isActive && attemptsLeft > 0;
  const attemptsList: any[] = (assignment as any)?.attempts || [];

  const handleConfirmStart = () => {
    if (!assignment) return;
    const sessionToken = crypto.randomUUID
      ? crypto.randomUUID()
      : `token_${Date.now()}_${Math.random()}`;
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
            {/* Status & Key Stats (6 Metric Cards) */}
            <Grid container spacing={2}>
              {/* 1. Duration */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
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

                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {assignment.durationMinutes} Mins
                  </Typography>
                </Paper>
              </Grid>

              {/* 2. Attempts Limit */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
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
                    Attempts Limit
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {attemptsCount} / {assignment.maxAttempts}
                  </Typography>
                </Paper>
              </Grid>

              {/* 3. Remaining */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
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
                      color: attemptsLeft > 0 ? "success.main" : "error.main",
                    }}
                  >
                    {Math.max(0, attemptsLeft)} Left
                  </Typography>
                </Paper>
              </Grid>

              {/* 4. Start Time */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
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
                    sx={{ fontWeight: 700, fontSize: "0.825rem" }}
                  >
                    {formatServerDate(assignment.startTime, "datetime")}
                  </Typography>
                </Paper>
              </Grid>

              {/* 5. End Time */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
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
                    sx={{ fontWeight: 700, fontSize: "0.825rem" }}
                  >
                    {assignment.endTime
                      ? formatServerDate(assignment.endTime, "datetime")
                      : "No Limit"}
                  </Typography>
                </Paper>
              </Grid>

              {/* 6. Status */}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
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
                    Status
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
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
                Previous Attempt History ({attemptsList.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {attemptsList.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", py: 1 }}
                >
                  No previous attempts recorded for this assignment.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {attemptsList.map((att, idx) => (
                    <Paper
                      key={att.attemptId || att.id || idx}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700 }}
                        >
                          Attempt #{att.attemptNumber || idx + 1}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Score: {att.totalScore ?? "N/A"} /{" "}
                          {att.maxScore ?? 10} • Submitted:{" "}
                          {formatServerDate(
                            att.submittedAt || att.startedAt || new Date(),
                            "datetime",
                          )}{" "}
                          • Status: {att.status}
                        </Typography>
                      </Box>

                      <Link
                        href={`/courses/${courseId}/quizzes/attempts/${att.attemptId || att.id}/result`}
                        passHref
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Eye size={14} />}
                          sx={{ borderRadius: 1.5 }}
                        >
                          View Result
                        </Button>
                      </Link>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            {!isActive && assignment && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                {assignment.status === "SCHEDULED"
                  ? "This quiz assignment is scheduled and has not opened yet. You can only start when the status is Active."
                  : "This quiz assignment is closed. Submissions are no longer accepted."}
              </Alert>
            )}

            {/* Start Attempt Action Footer */}
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
                sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
              >
                {attemptsCount > 0 ? "Retake / Resume Quiz" : "Start Attempt"}
              </Button>
            </Box>
          </Stack>
        )}
      </InfoDialog>

      {/* Confirmation Dialog with exact quiz/assignment title */}
      <Dialog
        open={confirmOpen}
        onClose={() => !startMutation.isPending && setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
          Confirm Start Quiz
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary">
            Are you sure you want to start the quiz{" "}
            <b>"{assignment?.assignmentName || "Quiz Assignment"}"</b>?
          </Typography>
          <Alert
            severity="info"
            icon={<ShieldAlert size={18} />}
            sx={{ mt: 2, borderRadius: 2, textAlign: "left" }}
          >
            Timer ({assignment?.durationMinutes} mins) will begin immediately
            upon confirmation.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2.5 }}>
          <Button
            variant="outlined"
            onClick={() => setConfirmOpen(false)}
            disabled={startMutation.isPending}
            sx={{ borderRadius: 2 }}
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
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            {startMutation.isPending ? "Starting Exam..." : "Yes, Start Quiz"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
