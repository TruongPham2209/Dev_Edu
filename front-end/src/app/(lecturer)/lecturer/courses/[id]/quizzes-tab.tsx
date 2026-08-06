"use client";

import { AnimatedTabs } from "@/components/common/animated-tabs";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SearchInput } from "@/components/common/form/search-input";
import { QuizDetailDialog } from "@/components/dialog/quiz/quiz-detail-dialog";
import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import {
  getQuizById,
  useQuizzesByCourseQuery,
  useSubmitQuizMutation,
} from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import { CustomPaging } from "@/lib/type/api";
import type { QuizResponse, QuizStatus } from "@/lib/type/quizzes";
import { formatServerDate } from "@/lib/util/date-utils";
import { validateQuizForSubmit } from "@/lib/util/quiz-utils";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Copy, Edit, Eye, HelpCircle, Plus, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function LecturerCourseQuizzesTab({ courseId }: { courseId: string }) {
  const toast = useToast();
  const router = useRouter();

  const [selectedStatusTab, setSelectedStatusTab] = useState<string>("DRAFT");
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // Modals & Actions state
  const [selectedQuizForDetail, setSelectedQuizForDetail] =
    useState<QuizResponse | null>(null);
  const [submitConfirmTarget, setSubmitConfirmTarget] =
    useState<QuizResponse | null>(null);
  const [actionLoadingQuizId, setActionLoadingQuizId] = useState<string | null>(
    null,
  );

  const {
    data: quizzesData,
    isLoading,
    isError,
    refetch,
  } = useQuizzesByCourseQuery(courseId, selectedStatusTab as QuizStatus);

  const quizzes: QuizResponse[] = useMemo(() => {
    if (!quizzesData) return [];
    if (Array.isArray(quizzesData)) return quizzesData;
    return (quizzesData as CustomPaging<QuizResponse>).contents || [];
  }, [quizzesData]);

  const submitQuizMutation = useSubmitQuizMutation({
    onSuccess: () => {
      toast.success("Submitted quiz for approval successfully!");
      setSubmitConfirmTarget(null);
      refetch();
    },
    onError: (err) => {
      toast.error(`Failed to submit quiz: ${err.message}`);
    },
  });

  const filteredQuizzes = useMemo(() => {
    if (!searchKeyword.trim()) return quizzes;
    const kw = searchKeyword.toLowerCase();
    return quizzes.filter(
      (q) =>
        q.title.toLowerCase().includes(kw) ||
        (q.description && q.description.toLowerCase().includes(kw)),
    );
  }, [quizzes, searchKeyword]);

  // Handler when clicking Submit button on a quiz item -> Open Confirm Dialog FIRST
  const handleSubmitClick = (quiz: QuizResponse) => {
    setSubmitConfirmTarget(quiz);
  };

  // Handler when user confirms Submit in the Confirm Dialog -> Validate THEN Submit
  const handleConfirmSubmit = async () => {
    if (!submitConfirmTarget) return;

    try {
      setActionLoadingQuizId(submitConfirmTarget.id);
      let fullQuiz = submitConfirmTarget;
      // Fetch full details if questions or typeConfigs are missing
      if (!submitConfirmTarget.typeConfigs || !submitConfirmTarget.questions) {
        const detailRes = await getQuizById(submitConfirmTarget.id);
        fullQuiz = {
          ...detailRes.quiz,
          typeConfigs: detailRes.typeConfigs,
          questions: detailRes.questions,
        };
      }

      const validation = validateQuizForSubmit(fullQuiz);
      if (!validation.isValid) {
        toast.error(
          validation.errorMessage || "Quiz configuration is invalid!",
        );
        return;
      }

      submitQuizMutation.mutate(submitConfirmTarget.id);
    } catch {
      toast.error("Failed to get quiz details for validation.");
    } finally {
      setActionLoadingQuizId(null);
    }
  };

  const handleDuplicateClick = () => {
    toast.warning("Quiz duplication feature is under development.");
  };

  return (
    <Card
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <HelpCircle className="text-blue-500" size={24} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Quizzes
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={() => {
                router.push(`/lecturer/courses/${courseId}/quizzes`);
              }}
              sx={{ borderRadius: 2 }}
            >
              New Quiz
            </Button>
          </Stack>
        </Box>

        <Stack spacing={2.5} sx={{ mb: 3 }}>
          <SearchInput
            value={searchKeyword}
            onChange={setSearchKeyword}
            onSearch={setSearchKeyword}
            placeholder="Search quiz..."
          />

          <AnimatedTabs
            value={selectedStatusTab}
            onChange={setSelectedStatusTab}
            tabs={[
              { label: "Draft", value: "DRAFT" },
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
            ]}
          />
        </Stack>

        {isLoading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rounded"
                height={75}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>
        ) : isError ? (
          <ErrorState title="Cannot load quiz list" onRetry={() => refetch()} />
        ) : filteredQuizzes.length === 0 ? (
          <EmptyState
            title="No quiz found"
            subtitle="Click 'New Quiz' to start designing the quiz for this course."
            actionLabel="New Quiz"
            onAction={() => {
              router.push(`/lecturer/courses/${courseId}/quizzes`);
            }}
          />
        ) : (
          <DataTable
            data={filteredQuizzes}
            minWidth={750}
            keyExtractor={(quiz: QuizResponse) => quiz.id}
            columns={[
              {
                header: "Quiz",
                render: (row: QuizResponse) => (
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {row.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {row.description || "No Description"}
                      {row.createdAt && ` • ${formatServerDate(row.createdAt)}`}
                    </Typography>

                    {row.status === "REJECTED" && row.rejectionReason && (
                      <Alert
                        severity="error"
                        sx={{
                          mt: 1,
                          py: 0,
                          px: 1,
                          fontSize: "0.75rem",
                          borderRadius: 1.5,
                        }}
                      >
                        Rejection Reason: {row.rejectionReason}
                      </Alert>
                    )}
                  </Box>
                ),
              },
              {
                header: "Status",
                width: 140,
                align: "center",
                render: (row: QuizResponse) => (
                  <QuizStatusChip status={row.status} />
                ),
              },
              {
                header: "Actions",
                width: 200,
                align: "center",
                render: (row: QuizResponse) => (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ justifyContent: "center", alignItems: "center" }}
                  >
                    {/* 1. Edit Action: All status EXCEPT REJECTED */}
                    {row.status !== "REJECTED" && (
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() =>
                            router.push(
                              `/lecturer/courses/${courseId}/quizzes/${row.id}`,
                            )
                          }
                        >
                          <Edit size={18} />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* 2. View Detail Action: Always displayed */}
                    <Tooltip title="Detail">
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => setSelectedQuizForDetail(row)}
                      >
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>

                    {/* 3. Duplicate Action: Always displayed */}
                    <Tooltip title="Duplicate">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={handleDuplicateClick}
                      >
                        <Copy size={18} />
                      </IconButton>
                    </Tooltip>

                    {/* 4. Submit Action: Only when status is DRAFT */}
                    {row.status === "DRAFT" &&
                      (() => {
                        const isItemLoading =
                          actionLoadingQuizId === row.id ||
                          (submitQuizMutation.isPending &&
                            submitConfirmTarget?.id === row.id);
                        return (
                          <Tooltip
                            title={isItemLoading ? "Processing..." : "Submit"}
                          >
                            <IconButton
                              size="small"
                              color="warning"
                              disabled={isItemLoading}
                              onClick={() => handleSubmitClick(row)}
                            >
                              {isItemLoading ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <Send size={18} />
                              )}
                            </IconButton>
                          </Tooltip>
                        );
                      })()}
                  </Stack>
                ),
              },
            ]}
          />
        )}

        {/* Quiz Detail Dialog */}
        <QuizDetailDialog
          open={!!selectedQuizForDetail}
          onClose={() => setSelectedQuizForDetail(null)}
          quiz={selectedQuizForDetail}
          role="LECTURER"
          onStatusChange={() => refetch()}
        />

        {/* Submit Confirmation Dialog */}
        <ConfirmDialog
          open={!!submitConfirmTarget}
          title="Submit Quiz for Approval"
          confirmLabel="Submit"
          cancelLabel="Cancel"
          confirmColor="warning"
          isLoading={
            submitQuizMutation.isPending ||
            actionLoadingQuizId === submitConfirmTarget?.id
          }
          onCancel={() => setSubmitConfirmTarget(null)}
          onConfirm={handleConfirmSubmit}
          description={
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Are you sure you want to submit the quiz{" "}
              <Typography
                component="span"
                sx={{ fontWeight: 700, color: "primary.main" }}
              >
                &quot;{submitConfirmTarget?.title}&quot;
              </Typography>{" "}
              for approval? After submission, you will not be able to edit the
              quiz until you receive a response.
            </Typography>
          }
        />
      </CardContent>
    </Card>
  );
}
