"use client";

import { QuizHero } from "@/app/(lecturer)/lecturer/courses/[id]/quizzes/quiz-hero";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { QuizAssignmentDetailModal } from "@/components/dialog/quiz-assignment/assignment-detail-modal";
import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import { useCourseByIdQuery } from "@/lib/api/courses";
import { useQuizAssignmentsByCourseQuery } from "@/lib/api/quizzes";
import type { QuizAssignmentResponse } from "@/lib/type/quizzes";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { Award, Calendar, Clock, HelpCircle, Info } from "lucide-react";
import { use, useState } from "react";

function QuizCardSkeleton() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 1, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box sx={{ flex: 1, pr: 1 }}>
          <Skeleton variant="text" width="65%" height={28} sx={{ mb: 0.5 }} />
          <Skeleton variant="rounded" width={70} height={20} />
        </Box>
        <Skeleton variant="rounded" width={80} height={24} />
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
        <Skeleton variant="text" width={110} height={20} />
        <Skeleton variant="text" width={100} height={20} />
      </Stack>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack spacing={0.5}>
          <Skeleton variant="text" width={130} height={18} />
          <Skeleton variant="text" width={130} height={18} />
        </Stack>
        <Skeleton
          variant="rounded"
          width={110}
          height={32}
          sx={{ borderRadius: 2 }}
        />
      </Box>
    </Card>
  );
}

export default function CourseQuizzesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: courseId } = use(params);
  const [selectedAssignment, setSelectedAssignment] =
    useState<QuizAssignmentResponse | null>(null);

  const { data: course, isLoading: isLoadingCourse } =
    useCourseByIdQuery(courseId);

  const {
    data: assignments = [],
    isLoading: isLoadingAssignments,
    isError,
    refetch,
  } = useQuizAssignmentsByCourseQuery(courseId);

  if (isLoadingCourse || isLoadingAssignments) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <QuizHero courseId={courseId} />
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4].map((i) => (
              <Grid key={i} size={{ xs: 12, md: 6 }}>
                <QuizCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      {/* Hero Header Section */}
      <QuizHero courseId={courseId} roleAccess="STUDENT" />

      {isError ? (
        <ErrorState
          title="Failed to load course quizzes"
          onRetry={() => refetch()}
        />
      ) : assignments.length === 0 ? (
        <EmptyState
          title="No quizzes available"
          subtitle="The instructor has not opened any quiz assignments for this course yet."
          icon={<HelpCircle size={36} />}
        />
      ) : (
        <Box sx={{ mt: 3 }}>
          <Grid container spacing={3}>
            {assignments.map((assignment) => {
              const assignmentName =
                assignment.assignmentName ||
                (assignment as any).quizTitle ||
                "Quiz Assignment";

              return (
                <Grid key={assignment.id} size={{ xs: 12, md: 6 }}>
                  <Card
                    variant="outlined"
                    onClick={() => setSelectedAssignment(assignment)}
                    sx={{
                      borderRadius: 1,
                      cursor: "pointer",
                      transition: "all 0.25s ease-in-out",
                      bgcolor: "background.paper",
                      "&:hover": {
                        borderColor: "primary.main",
                        transform: "translateY(-2px)",
                        boxShadow: "0 12px 28px rgba(37,99,235,0.08)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box sx={{ flex: 1, pr: 1 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, mb: 0.5 }}
                          >
                            {assignmentName}
                          </Typography>
                          <QuizStatusChip status={assignment.status} />
                        </Box>
                        <Chip
                          label={`${assignment.durationMinutes} Mins`}
                          size="small"
                          icon={<Clock size={12} />}
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Stack
                        direction="row"
                        spacing={3}
                        sx={{ color: "text.secondary", mb: 3 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Award size={14} /> Attempts:{" "}
                          <b>{assignment.maxAttempts}</b>
                        </Typography>
                      </Stack>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Calendar size={12} /> Start:{" "}
                            {formatServerDate(assignment.startTime, "datetime")}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Calendar size={12} /> End:{" "}
                            {assignment.endTime
                              ? formatServerDate(assignment.endTime, "datetime")
                              : "No Limit"}
                          </Typography>
                        </Stack>

                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Info size={14} />}
                          sx={{ borderRadius: 2, fontWeight: 700, px: 2 }}
                        >
                          View Quiz
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      <QuizAssignmentDetailModal
        open={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        assignment={selectedAssignment}
        courseId={courseId}
      />
    </Container>
  );
}
