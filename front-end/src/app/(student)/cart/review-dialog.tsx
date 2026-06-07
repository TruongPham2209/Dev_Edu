"use client";

import { CommentInput } from "@/components/common/comment-input";
import { ErrorState } from "@/components/common/error-state";
import { InfoDialog } from "@/components/common/info-dialog";
import { useCreateReviewMutation, useMyReviewQuery } from "@/lib/api/courses";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, CircularProgress, Rating, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Star } from "lucide-react";
import { useState } from "react";

interface ReviewDialogProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
}

export function ReviewDialog({ open, onClose, courseId }: ReviewDialogProps) {
  const queryClient = useQueryClient();
  const { handleError, showSuccess } = useApiWithToast();

  const {
    data: review,
    isLoading,
    isError,
    refetch,
  } = useMyReviewQuery(courseId, {
    enabled: open && !!courseId,
  });

  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);

  const { mutate: createReview, isPending } = useCreateReviewMutation({
    onSuccess: () => {
      showSuccess("Review added successfully!");
      queryClient.invalidateQueries({ queryKey: ["reviews", "my", courseId] });
    },
    onError: (error) => {
      handleError(error, "Error when adding review.");
    },
  });

  const handleSubmit = () => {
    createReview({ courseId, content, rating });
  };

  return (
    <InfoDialog
      open={open}
      onClose={onClose}
      title="Course Review"
      headerIcon={<Star size={24} color="#f59e0b" />}
      maxWidth="sm"
      paperSx={{
        minHeight: "50vh",
      }}
    >
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <ErrorState
          title="Failed to load review"
          onRetry={() => refetch()}
          actionLabel="Retry"
        />
      ) : review ? (
        <Box sx={{ py: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}
          >
            Your Review
          </Typography>
          <Rating value={review.rating} readOnly sx={{ mb: 2 }} />
          <Typography
            variant="body1"
            sx={{
              color: "#334155",
              p: 2,
              bgcolor: "#f8fafc",
              borderRadius: 2,
              border: "1px solid #e2e8f0",
            }}
          >
            {review.comment}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ py: 2 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.5,
              mb: 3,
              p: 2,
              bgcolor: "rgba(245, 158, 11, 0.1)",
              borderRadius: 2,
              color: "#d97706",
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: 2 }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Please note that your review cannot be undone once submitted. Make
              sure your feedback is helpful and constructive.
            </Typography>
          </Box>
          <CommentInput
            value={content}
            onChange={setContent}
            onSubmit={handleSubmit}
            submitting={isPending}
            showRating={true}
            rating={rating}
            onRatingChange={setRating}
            placeholder="Share your thoughts about this course..."
            title="Write a review"
          />
        </Box>
      )}
    </InfoDialog>
  );
}
