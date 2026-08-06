"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ColumnDef, DataTable } from "@/components/common/data-table";
import { ErrorState } from "@/components/common/error-state";
import { QuizAssignmentDialog } from "@/components/dialog/quiz-assignment/quiz-assignment-dialog";
import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import {
  useCreateQuizAssignmentMutation,
  useDeleteQuizAssignmentMutation,
  useQuizAssignmentsByQuizQuery,
  useQuizByIdQuery,
} from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import type {
  CreateAssignmentRequest,
  QuizAssignmentResponse,
} from "@/lib/type/quizzes";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Calendar, Plus, Shuffle, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { QuizHero } from "../../quiz-hero";

export default function LecturerAssignmentsPage() {
  const params = useParams<{ id: string; quizId: string }>();
  const { id: courseId, quizId } = params;
  const toast = useToast();

  // State
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [deletingAssignment, setDeletingAssignment] =
    useState<QuizAssignmentResponse | null>(null);

  // 1. Fetch Quiz Details
  const { data: quizDetail } = useQuizByIdQuery(quizId);
  const quizTitle = quizDetail?.quiz?.title || "";

  // 2. Fetch Assignments list for this Quiz
  const {
    data: assignments = [],
    isLoading,
    isError,
    refetch,
  } = useQuizAssignmentsByQuizQuery(quizId, {
    enabled: !!quizId,
  });

  // Mutations
  const createAssignmentMutation = useCreateQuizAssignmentMutation({
    onSuccess: () => {
      toast.success("Assignment created successfully!");
      setOpenCreateDialog(false);
      refetch();
    },
    onError: (err) => {
      toast.error(`Failed to create assignment: ${err.message}`);
    },
  });

  const deleteAssignmentMutation = useDeleteQuizAssignmentMutation({
    onSuccess: () => {
      toast.success("Assignment deleted successfully!");
      setDeletingAssignment(null);
      refetch();
    },
    onError: (err) => {
      toast.error(`Failed to delete assignment: ${err.message}`);
    },
  });

  // Handlers
  const handleSaveAssignment = async (data: CreateAssignmentRequest) => {
    await createAssignmentMutation.mutateAsync(data);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAssignment) return;
    await deleteAssignmentMutation.mutateAsync(deletingAssignment.id);
  };

  // DataTable Columns Configuration using common DataTable
  const columns: ColumnDef<QuizAssignmentResponse>[] = useMemo(
    () => [
      {
        header: "Assignment Name",
        width: "200px",
        skeletonVariant: "text",
        render: (item) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {item.assignmentName || "—"}
          </Typography>
        ),
      },
      {
        header: "Start Time",
        width: "170px",
        skeletonVariant: "text",
        render: (item) => formatServerDate(item.startTime, "datetime"),
      },
      {
        header: "End Time",
        width: "170px",
        skeletonVariant: "text",
        render: (item) =>
          item.endTime
            ? formatServerDate(item.endTime, "datetime")
            : "No Limit",
      },
      {
        header: "Duration",
        width: "110px",
        skeletonVariant: "text",
        render: (item) => `${item.durationMinutes} mins`,
      },
      {
        header: "Attempts",
        width: "100px",
        skeletonVariant: "text",
        render: (item) => `${item.maxAttempts} time(s)`,
      },
      {
        header: "Shuffle Rules",
        width: "190px",
        skeletonVariant: "rounded",
        render: (item) => (
          <Stack direction="row" spacing={0.5}>
            {item.shuffleQuestions && (
              <Tooltip title="Questions Shuffled">
                <Chip
                  icon={<Shuffle size={11} />}
                  label="Q-Shuffle"
                  size="small"
                  variant="outlined"
                  color="info"
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              </Tooltip>
            )}
            {item.shuffleOptions && (
              <Tooltip title="Options Shuffled">
                <Chip
                  icon={<Shuffle size={11} />}
                  label="Opt-Shuffle"
                  size="small"
                  variant="outlined"
                  color="secondary"
                  sx={{ height: 20, fontSize: "0.7rem" }}
                />
              </Tooltip>
            )}
            {!item.shuffleQuestions && !item.shuffleOptions && (
              <Typography variant="caption" color="text.secondary">
                None
              </Typography>
            )}
          </Stack>
        ),
      },
      {
        header: "Status",
        width: "120px",
        skeletonVariant: "rounded",
        render: (item) => <QuizStatusChip status={item.status} />,
      },
      {
        header: "Actions",
        width: "80px",
        align: "right",
        skeletonVariant: "action",
        render: (item) => (
          <Tooltip title="Delete Assignment">
            <IconButton
              color="error"
              size="small"
              onClick={() => setDeletingAssignment(item)}
            >
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [],
  );

  if (isError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <QuizHero courseId={courseId} quizTitle={quizTitle} />
        <Box sx={{ mt: 3 }}>
          <ErrorState
            title="Failed to load assignments"
            subtitle="An error occurred while fetching the assignment list."
            onRetry={() => refetch()}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header Breadcrumbs */}
        <QuizHero courseId={courseId} quizTitle={quizTitle} />

        {/* Main Content Card */}
        <Card variant="outlined" sx={{ borderRadius: 1 }}>
          <CardContent sx={{ p: 3 }}>
            {/* Header Box */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Quiz Assignments ({assignments.length})
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Manage schedule, open/close periods, and attempt rules for
                  this quiz.
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                startIcon={<Plus size={16} />}
                onClick={() => setOpenCreateDialog(true)}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Create Assignment
              </Button>
            </Box>

            {/* Reusable Data Table Component */}
            <DataTable
              columns={columns}
              data={assignments}
              loading={isLoading}
              mode="infinite"
              keyExtractor={(item) => item.id}
              minWidth={1150}
              emptyState={
                <Paper
                  elevation={0}
                  sx={{
                    p: 5,
                    textAlign: "center",
                    bgcolor: "action.hover",
                    borderRadius: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "primary.50",
                      color: "primary.main",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1.5,
                    }}
                  >
                    <Calendar size={24} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                    No Assignments Found
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2.5 }}
                  >
                    There are no schedules or assignments configured for this
                    quiz yet.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={16} />}
                    onClick={() => setOpenCreateDialog(true)}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Create Assignment
                  </Button>
                </Paper>
              }
            />
          </CardContent>
        </Card>
      </Stack>

      {/* Dialog Create Assignment */}
      <QuizAssignmentDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSave={handleSaveAssignment}
        loading={createAssignmentMutation.isPending}
        defaultQuizId={quizId}
        quizTitle={quizTitle}
      />

      {/* Confirm Dialog Delete */}
      <ConfirmDialog
        open={!!deletingAssignment}
        title="Delete Quiz Assignment"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        isLoading={deleteAssignmentMutation.isPending}
        onCancel={() => setDeletingAssignment(null)}
        onConfirm={handleConfirmDelete}
        description={
          deletingAssignment && (
            <Box component="span" sx={{ color: "text.secondary" }}>
              Are you sure you want to delete assignment{" "}
              <Box
                component="span"
                sx={{ fontWeight: 700, color: "error.main" }}
              >
                "
                {deletingAssignment.assignmentName ||
                  `#${deletingAssignment.id.slice(0, 8)}`}
                "
              </Box>{" "}
              (Start Time:{" "}
              <strong>
                {formatServerDate(deletingAssignment.startTime, "datetime")}
              </strong>
              )?
            </Box>
          )
        }
      />
    </Container>
  );
}
