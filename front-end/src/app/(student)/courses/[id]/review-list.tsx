"use client";

import { ReviewResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/date-utils";
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
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
          p: 2,
          borderRadius: 3,
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
            {reviewCount === 0 || !rating
              ? "No reviews yet"
              : rating >= 4.0
                ? "This course is highly rated!"
                : "Student feedback"}
          </Typography>
          <Typography sx={{ color: "#475569", lineHeight: 1.6 }}>
            {reviewCount === 0 || !rating
              ? "Be the first to share your experience and thoughts about this course."
              : rating >= 4.0
                ? "Most students are satisfied with the teaching quality and practical application of this course."
                : "See what students are saying about the teaching quality and practical application of this course."}
          </Typography>
        </Box>
      </Paper>

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
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            border: "1px dashed #cbd5e1",
            bgcolor: "rgba(248, 250, 252, 0.5)",
          }}
        >
          <Typography sx={{ color: "#64748b", fontWeight: 500 }}>
            This course has no reviews yet. Be the first one!
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={3}>
          {reviews.map((review) => (
            <Paper
              key={review.id}
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 3,
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
              <Box sx={{ display: "flex", gap: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "#38bdf8",
                    width: 56,
                    height: 56,
                    fontWeight: 700,
                    fontSize: "1.25rem",
                  }}
                >
                  {(review.username || "H").charAt(0).toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#0f172a",
                          fontSize: "1.125rem",
                          mb: 0.5,
                        }}
                      >
                        {review.username}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <Rating
                          value={review.rating}
                          readOnly
                          size="small"
                          sx={{ color: "#fbbf24" }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.875rem",
                            color: "#94a3b8",
                            fontWeight: 500,
                          }}
                        >
                          {formatDate(review.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      color: "#475569",
                      lineHeight: 1.7,
                      mt: 2,
                      fontSize: "1rem",
                    }}
                  >
                    {review.comment}
                  </Typography>
                </Box>
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
