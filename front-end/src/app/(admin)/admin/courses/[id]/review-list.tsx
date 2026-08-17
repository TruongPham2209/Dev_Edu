"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import {
  useCourseReviewsInfiniteQuery,
  useDeleteReviewMutation,
} from "@/lib/api/courses";
import { ReviewResponse } from "@/lib/type/courses";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Rating,
  Stack,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ReviewListProps {
  courseId: string;
}

export function ReviewList({ courseId }: ReviewListProps) {
  const queryClient = useQueryClient();
  const { handleError, showSuccess } = useApiWithToast();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useCourseReviewsInfiniteQuery(courseId);

  const deleteMutation = useDeleteReviewMutation();

  const [confirmDeleteReview, setConfirmDeleteReview] =
    useState<ReviewResponse | null>(null);

  const handleDelete = async () => {
    if (!confirmDeleteReview) return;
    try {
      await deleteMutation.mutateAsync(confirmDeleteReview.id);
      showSuccess("Review deleted successfully");
      queryClient.invalidateQueries({
        queryKey: ["reviews", "course-infinite", courseId],
      });
      setConfirmDeleteReview(null);
    } catch (e) {
      handleError(e, "Failed to delete review");
    }
  };

  const reviews = data?.pages.flatMap((page) => page.contents) || [];

  // Infinite Scroll Observer
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Card
      sx={{
        borderRadius: 1,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        height: { xs: 450, sm: 520 }, // Consistent height for the Data Row
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(245, 158, 11, 0.08)",
              color: "rgb(245, 158, 11)",
              width: 36,
              height: 36,
              border: "1px solid rgba(245, 158, 11, 0.12)",
            }}
          >
            <Star size={18} />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.2,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Reviews
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage reviews for this course
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content Area */}
      <CardContent
        sx={{
          p: 0,
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 0 },
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : isError ? (
          <Box sx={{ m: "auto", p: 4, width: "100%" }}>
            <ErrorState
              title="Failed to load reviews"
              subtitle={
                error instanceof Error
                  ? error.message
                  : "An unexpected error occurred."
              }
              onRetry={() => refetch()}
              actionLabel="Retry"
            />
          </Box>
        ) : reviews.length === 0 ? (
          <Box sx={{ m: "auto", p: 4, width: "100%" }}>
            <EmptyState
              title="No Reviews Yet"
              subtitle="This course has no reviews currently."
            />
          </Box>
        ) : (
          <Stack spacing={0} sx={{ width: "100%" }}>
            {reviews.map((review, index) => (
              <Box key={review.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 2 },
                    transition: "background-color 0.15s ease",
                    "&:hover": {
                      bgcolor: "rgba(15, 23, 42, 0.02)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={{ xs: 1.5, sm: 2 }}
                    sx={{ overflow: "hidden", mr: 1.5, flexGrow: 1 }}
                  >
                    <Avatar
                      src={review.avatarUrl || undefined}
                      alt={review.username}
                      sx={{
                        width: { xs: 36, sm: 44 },
                        height: { xs: 36, sm: 44 },
                        flexShrink: 0,
                        border: "1px solid rgba(15, 23, 42, 0.08)",
                      }}
                    >
                      {review.fullName
                        ? review.fullName[0]
                        : review.username[0]}
                    </Avatar>
                    <Box sx={{ overflow: "hidden", flexGrow: 1 }}>
                      <Stack
                        component="div"
                        direction="row"
                        spacing={1.5}
                        sx={{
                          alignItems: "center",
                          mb: 0.5,
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            fontSize: { xs: "0.875rem", sm: "0.95rem" },
                            wordBreak: "break-word",
                          }}
                        >
                          {review.fullName || review.username}
                        </Typography>
                        <Rating
                          value={review.rating}
                          readOnly
                          size="small"
                          precision={0.5}
                          sx={{ color: "rgb(245, 158, 11)" }}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mt: 0.5,
                          whiteSpace: "pre-line",
                          wordBreak: "break-word",
                        }}
                      >
                        {review.comment}
                      </Typography>

                      <Box sx={{ color: "text.disabled", mt: 1 }}>
                        <Typography variant="caption">
                          {formatServerDate(review.createdAt, "datetime")}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  <Box sx={{ flexShrink: 0 }}>
                    <ButtonAction
                      icon={<Trash2 size={16} />}
                      tooltip="Delete review"
                      color="error"
                      variant="soft"
                      onClick={() => setConfirmDeleteReview(review)}
                    />
                  </Box>
                </Box>
                {index < reviews.length - 1 && (
                  <Divider
                    sx={{ mx: 3, borderColor: "rgba(15, 23, 42, 0.04)" }}
                  />
                )}
              </Box>
            ))}

            {/* Observer Target */}
            <Box
              ref={observerTarget}
              sx={{ p: 2, display: "flex", justifyContent: "center" }}
            >
              {isFetchingNextPage && <CircularProgress size={24} />}
            </Box>
          </Stack>
        )}
      </CardContent>

      <ConfirmDialog
        open={Boolean(confirmDeleteReview)}
        title="Delete review?"
        description={
          deleteMutation.isPending
            ? `Deleting review by "${confirmDeleteReview?.username || ""}"...`
            : `Are you sure you want to delete the review by "${confirmDeleteReview?.username || ""}"? This action cannot be undone.`
        }
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteReview(null)}
      />
    </Card>
  );
}
