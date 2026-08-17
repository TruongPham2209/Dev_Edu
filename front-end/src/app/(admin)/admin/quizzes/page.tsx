"use client";

import {
  AnimatedTabItem,
  AnimatedTabs,
} from "@/components/common/animated-tabs";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormInput } from "@/components/common/form/form-input";
import { HeroInfo } from "@/components/common/hero-section/hero-info";
import { QuizDetailDialog } from "@/components/dialog/quiz/quiz-detail-dialog";
import {
  useQuizzesInfiniteQuery,
  useReviewQuizMutation,
} from "@/lib/api/quizzes";
import { useToast } from "@/lib/toast-context";
import type { QuizResponse, QuizStatus } from "@/lib/type/quizzes";
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { HelpCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { QuizCard } from "./quiz-card";

type TabStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_TABS: AnimatedTabItem<TabStatus>[] = [
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function AdminQuizManagementPage() {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<TabStatus>("PENDING");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResponse | null>(null);
  const [moderationTarget, setModerationTarget] = useState<{
    quiz: QuizResponse;
    type: "approve" | "reject";
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");

  const apiStatusFilter: QuizStatus = activeTab as QuizStatus;

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useQuizzesInfiniteQuery(apiStatusFilter);

  // Review mutation
  const reviewMutation = useReviewQuizMutation({
    onSuccess: (_, variables) => {
      if (variables.review.approved) {
        toast.success("Approved quiz successfully");
      } else {
        toast.success("Rejected quiz successfully");
      }
      setModerationTarget(null);
      setRejectionReason("");
      refetch();
    },
    onError: (err) => {
      toast.error(`Quiz approval failed: ${err.message}`);
    },
  });

  // Flatten infinite pages into single array
  const quizzes = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.contents || []);
  }, [data]);

  const handleOpenApprove = (quiz: QuizResponse) => {
    setRejectionReason("");
    setModerationTarget({ quiz, type: "approve" });
  };

  const handleOpenReject = (quiz: QuizResponse) => {
    setRejectionReason("");
    setModerationTarget({ quiz, type: "reject" });
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

  const handleCloseConfirm = () => {
    if (reviewMutation.isPending) return;
    setModerationTarget(null);
    setRejectionReason("");
  };

  return (
    <Stack spacing={{ xs: 2.5, sm: 3 }} sx={{ width: "100%", overflowX: "hidden", pb: { xs: 3, sm: 5 } }}>
      {/* 1. Hero Section */}
      <HeroInfo
        title="Quizzes Management"
        description="Streamline the review process with powerful moderation tools. Approve, reject, and manage quiz submissions efficiently to maintain content quality."
        icon={<ShieldCheck size={24} className="text-blue-400" />}
        tags={["Review Quizzes", "Approve Quizzes", "Reject Quizzes"]}
      />

      {/* 2. Quiz Status Tabs (excluding DRAFT) */}
      <Box sx={{ mb: { xs: 2.5, sm: 4 }, borderBottom: 1, borderColor: "divider" }}>
        <AnimatedTabs
          tabs={STATUS_TABS}
          value={activeTab}
          onChange={(val) => setActiveTab(val as TabStatus)}
        />
      </Box>

      {/* 3. Quiz List & States */}
      {isLoading ? (
        <Grid container spacing={{ xs: 2, sm: 3 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, md: 6, lg: 4 }}>
              <Skeleton
                variant="rounded"
                height={260}
                sx={{ borderRadius: 1 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : isError ? (
        <ErrorState
          title="Error loading quiz list"
          subtitle="Failed to connect to the server. Please try again later."
          onRetry={() => refetch()}
        />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No quizzes found"
          subtitle={`There are no quizzes in "${STATUS_TABS.find((t) => t.value === activeTab)?.label}" status.`}
          icon={<HelpCircle size={36} />}
        />
      ) : (
        <Box>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            {quizzes.map((quiz) => (
              <Grid key={quiz.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <QuizCard
                  quiz={quiz}
                  onViewDetails={setSelectedQuiz}
                  onApprove={handleOpenApprove}
                  onReject={handleOpenReject}
                  isActionPending={reviewMutation.isPending}
                />
              </Grid>
            ))}
          </Grid>

          {/* Infinite Scroll / Load More section */}
          {hasNextPage && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: { xs: 3, sm: 5 },
                mb: 2,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                startIcon={
                  isFetchingNextPage ? (
                    <CircularProgress size={16} />
                  ) : (
                    <RefreshCw size={16} />
                  )
                }
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.2,
                  fontWeight: 700,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                {isFetchingNextPage ? "Loading..." : "Load more quizzes"}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* 4. Quiz Detail Modal using InfoDialog */}
      <QuizDetailDialog
        open={!!selectedQuiz}
        onClose={() => setSelectedQuiz(null)}
        quiz={selectedQuiz}
        role="ADMIN"
        onStatusChange={() => refetch()}
      />

      {/* 5. Moderation Confirmation Dialog (Approve & Reject with status tailoring) */}
      <ConfirmDialog
        open={!!moderationTarget}
        title={
          moderationTarget?.type === "approve" ? "Approve Quiz" : "Reject Quiz"
        }
        confirmLabel={
          moderationTarget?.type === "approve" ? "Approve" : "Reject"
        }
        cancelLabel="Cancel"
        confirmColor={
          moderationTarget?.type === "approve" ? "success" : "error"
        }
        isLoading={reviewMutation.isPending}
        onCancel={handleCloseConfirm}
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
                  &quot;{moderationTarget.quiz.title}&quot;
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
    </Stack>
  );
}
