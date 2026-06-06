"use client";

import { ReviewResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  Box,
  Button,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { MessageSquare } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";

interface ReviewListProps {
  reviews: ReviewResponse[];
  rating: number;
  reviewCount: number;
  loadingReviews: boolean;
  nextCursor: string | null;
  loadingMoreReviews: boolean;
  loadMoreReviews: () => void;
}

export const ReviewList = ({
  reviews,
  rating,
  reviewCount,
  loadingReviews,
  nextCursor,
  loadingMoreReviews,
  loadMoreReviews,
}: ReviewListProps) => {
  const formatDate = (dateString?: unknown) => {
    if (!dateString) return "Not updated";
    return formatServerDate(dateString);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            bgcolor: "#fef3c7",
            borderRadius: 3,
            color: "#d97706",
          }}
        >
          <MessageSquare size={28} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Reviews from students
          </Typography>
          <Typography sx={{ color: "#64748b", mt: 0.5 }}>
            What do students say about this course?
          </Typography>
        </Box>
      </Box>

      {/* Review Summary Card */}
      {reviews.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
            p: 2,
            borderRadius: 1,
            border: "1px solid #e2e8f0",
            alignItems: "center",
            bgcolor: "white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              pr: { xs: 0, sm: 4 },
              borderRight: { xs: "none", sm: "1px solid #e2e8f0" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Typography
              variant="h2"
              sx={{ fontWeight: 900, color: "#0f172a", mb: 1 }}
            >
              {rating ? rating.toFixed(1) : "0.0"}
            </Typography>
            <Rating
              value={rating || 0}
              readOnly
              precision={0.1}
              size="large"
              sx={{ color: "#fbbf24" }}
            />
            <Typography sx={{ color: "#64748b", mt: 1, fontWeight: 500 }}>
              {reviewCount || 0} reviews
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, mb: 1, color: "#1e293b" }}
            >
              {rating >= 4.0
                ? "This course is highly rated!"
                : "Student feedback"}
            </Typography>
            <Typography sx={{ color: "#475569", lineHeight: 1.6 }}>
              {rating >= 4.0
                ? "Most students are satisfied with the teaching quality and practical application of this course."
                : "See what students are saying about the teaching quality and practical application of this course."}
            </Typography>
          </Box>
        </Paper>
      )}

      {loadingReviews ? (
        <Stack spacing={3}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", gap: 2 }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton
                  variant="text"
                  width="20%"
                  height={24}
                  sx={{ mb: 1 }}
                />
                <Skeleton
                  variant="text"
                  width="15%"
                  height={20}
                  sx={{ mb: 2 }}
                />
                <Skeleton variant="text" width="100%" height={60} />
              </Box>
            </Box>
          ))}
        </Stack>
      ) : reviews.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            height: 300,
            borderRadius: 1,
            bgcolor: "#e2e8f0",
          }}
        >
          <EmptyState
            title="No reviews yet"
            subtitle="Be the first to share your experience and thoughts about this course."
            icon={<MessageSquare size={28} />}
          />
        </Box>
      ) : (
        <Stack spacing={3}>
          {reviews.map((review) => (
            <Paper
              key={review.id}
              elevation={0}
              sx={{
                px: 4,
                py: 2,
                borderRadius: 1,
                border: "1px solid #e2e8f0",
                bgcolor: "white",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#cbd5e1",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    src={review.avatarUrl}
                    sx={{
                      bgcolor: "#38bdf8",
                      width: 40,
                      height: 40,
                      fontWeight: 700,
                      fontSize: "1rem",
                    }}
                  >
                    {(review.fullName || review.username || "H")
                      .charAt(0)
                      .toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: "#1e293b",
                        fontSize: "0.95rem",
                      }}
                    >
                      {review.fullName || review.username}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        mt: 0.25,
                      }}
                    >
                      @{review.username}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Rating
                    value={review.rating}
                    readOnly
                    size="small"
                    sx={{ color: "#fbbf24", fontSize: "1rem" }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.85rem",
                      color: "#64748b",
                    }}
                  >
                    {formatDate(review.createdAt)}
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: "#334155",
                    lineHeight: 1.6,
                    fontSize: "0.95rem",
                  }}
                >
                  {review.comment}
                </Typography>
              </Box>
            </Paper>
          ))}

          {nextCursor && (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Button
                variant="outlined"
                onClick={loadMoreReviews}
                disabled={loadingMoreReviews}
                sx={{
                  borderRadius: 20,
                  px: 6,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderWidth: 2,
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: "#64748b",
                    bgcolor: "#f8fafc",
                  },
                }}
              >
                {loadingMoreReviews ? "Loading more..." : "See more reviews"}
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};
