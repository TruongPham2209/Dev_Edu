"use client";

import { EssayGradingCard } from "@/components/card/essay-grading-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import {
  FilterItem,
  FilterSelect,
} from "@/components/common/form/filter-select";
import {
  useEssaySubmissionsInfiniteQuery,
  useQuizByIdQuery,
} from "@/lib/api/quizzes";
import type { QuizEssaySubmissionResponse } from "@/lib/type/quizzes";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircle2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { QuizHero } from "../../quiz-hero";

const STATUS_OPTIONS: FilterItem[] = [
  { id: "ALL", title: "All Submissions" },
  { id: "PENDING", title: "Needs Grading" },
  { id: "GRADED", title: "Graded" },
];

export default function LecturerQuizGradingPage() {
  const params = useParams<{ id: string; quizId: string }>();
  const { id: courseId, quizId } = params;

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { data: quizDetail } = useQuizByIdQuery(quizId);
  const quizTitle = quizDetail?.quiz.title;

  const {
    data,
    isLoading,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useEssaySubmissionsInfiniteQuery(quizId, statusFilter);

  const essaySubmissions: QuizEssaySubmissionResponse[] =
    data?.pages.flatMap((page) => page.contents) ?? [];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumb Header */}
      <QuizHero courseId={courseId} quizTitle={quizTitle} />

      {/* Page Title & Status Filter */}
      <Box
        sx={{
          mt: 3,
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Essay Submissions & Grading
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and grade student essay submissions directly.
          </Typography>
        </Box>

        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          items={STATUS_OPTIONS}
          defaultValue="ALL"
        />
      </Box>

      {/* Main Content */}
      {isLoading ? (
        <Stack spacing={3}>
          {[1, 2, 3].map((key) => (
            <Paper key={key} sx={{ p: 3, borderRadius: 3 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Skeleton variant="circular" width={44} height={44} />
                <Box sx={{ width: 200 }}>
                  <Skeleton variant="text" width="100%" height={24} />
                  <Skeleton variant="text" width="60%" height={16} />
                </Box>
              </Box>
              <Skeleton
                variant="rectangular"
                height={80}
                sx={{ borderRadius: 2, mb: 2 }}
              />
              <Skeleton
                variant="rectangular"
                height={100}
                sx={{ borderRadius: 2 }}
              />
            </Paper>
          ))}
        </Stack>
      ) : isError ? (
        <ErrorState
          title="Failed to load essay submissions"
          onRetry={() => refetch()}
        />
      ) : essaySubmissions.length === 0 ? (
        <EmptyState
          title="No essay submissions found"
          subtitle={
            statusFilter === "ALL"
              ? "There are currently no essay submissions for this quiz."
              : `No submissions found matching the "${statusFilter}" status filter.`
          }
          icon={<CheckCircle2 size={40} />}
        />
      ) : (
        <Stack spacing={3}>
          {essaySubmissions.map((item, index) => (
            <EssayGradingCard
              key={
                item.attemptAnswerId ||
                `${item.attemptId}_${item.questionId}_${index}`
              }
              submission={item}
              onGradedSuccess={() => refetch()}
            />
          ))}

          {hasNextPage && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                startIcon={
                  isFetchingNextPage ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
                sx={{ borderRadius: 999, px: 4, py: 1, fontWeight: 700 }}
              >
                {isFetchingNextPage
                  ? "Loading more..."
                  : "Load More Submissions"}
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Container>
  );
}
