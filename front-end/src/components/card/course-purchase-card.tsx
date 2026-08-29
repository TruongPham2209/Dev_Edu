"use client";

import type { CourseResponse } from "@/lib/type/courses";
import type { LectureResponse } from "@/lib/type/lectures";
import { Box, Button, Stack, Typography, alpha } from "@mui/material";
import {
  Award,
  BookOpen,
  Loader2,
  PlayCircle,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/util/date-utils";

export interface CoursePurchaseCardProps {
  course: CourseResponse;
  isEnrolled: boolean;
  lectures: LectureResponse[];
  handleBuyNow: () => void;
  handleAddToCart: () => void;
  loadingAction: "buy" | "cart" | null;
  showPurchase?: boolean;
}

export function CoursePurchaseCard({
  course,
  isEnrolled,
  lectures,
  handleBuyNow,
  handleAddToCart,
  loadingAction,
  showPurchase = true,
}: CoursePurchaseCardProps) {
  const isFree =
    course.originalPrice === 0 ||
    (course.discountedPercentage && course.discountedPercentage >= 100);
  const displayPrice =
    course.discountedPercentage && course.originalPrice
      ? course.originalPrice * (1 - course.discountedPercentage / 100)
      : course.originalPrice;

  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
            : "0 10px 30px -5px rgba(15, 23, 42, 0.08)",
        color: "text.primary",
        mb: 4,
      }}
    >
      <Box
        sx={{
          position: "relative",
          paddingTop: "56.25%",
          bgcolor: "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {course.thumbnailUrl ? (
          <Box
            component="img"
            src={course.thumbnailUrl}
            alt={course.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              p: 2,
              transition: "transform 0.5s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              bgcolor: "action.hover",
            }}
          >
            <PlayCircle
              size={64}
              color="currentColor"
              style={{ opacity: 0.6 }}
              strokeWidth={1.5}
            />
            <Typography
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              Preview course
            </Typography>
          </Box>
        )}
        {/* Play Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.3)",
            opacity: 0,
            transition: "opacity 0.2s",
            "&:hover": { opacity: 1 },
            cursor: "pointer",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.3)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <PlayCircle size={32} color="white" />
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: isFree ? "success.main" : "text.primary",
              letterSpacing: "-0.02em",
            }}
          >
            {isFree
              ? "Free"
              : `${displayPrice ? formatPrice(displayPrice) : "0"}đ`}
          </Typography>
          {!isFree &&
            course.originalPrice &&
            course.originalPrice !== displayPrice && (
              <Typography
                variant="h6"
                sx={{
                  textDecoration: "line-through",
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                {formatPrice(course.originalPrice)}đ
              </Typography>
            )}
        </Box>

        <Stack spacing={2} sx={{ mb: 3 }}>
          {isEnrolled ? (
            <Button
              component={Link}
              href={`/courses/${course.id}/lectures`}
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: "1rem",
                background: "linear-gradient(to right, #3b82f6, #6366f1)",
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
                "&:hover": {
                  background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  boxShadow: "0 15px 20px -3px rgba(59, 130, 246, 0.4)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
              startIcon={<PlayCircle size={24} />}
            >
              Start learning
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleBuyNow}
                disabled={loadingAction !== null || !showPurchase}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: "1rem",
                  background: "linear-gradient(to right, #e11d48, #be123c)",
                  boxShadow: "0 10px 15px -3px rgba(225, 29, 72, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(to right, #be123c, #9f1239)",
                    boxShadow: "0 15px 20px -3px rgba(225, 29, 72, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "action.disabledBackground",
                    color: "text.disabled",
                    boxShadow: "none",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Register now
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleAddToCart}
                disabled={loadingAction !== null || !showPurchase}
                sx={{
                  py: 1.75,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderWidth: 2,
                  borderColor: "divider",
                  color: "text.primary",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: "primary.main",
                    bgcolor: "action.hover",
                    color: "primary.main",
                  },
                  "&.Mui-disabled": {
                    borderColor: "divider",
                    color: "text.disabled",
                  },
                }}
                startIcon={
                  loadingAction === "cart" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ShoppingCart size={20} />
                  )
                }
              >
                {loadingAction === "cart" ? "Processing..." : "Add to cart"}
              </Button>
              {!showPurchase && (
                <Typography
                  sx={{
                    textAlign: "center",
                    color: "error.main",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    mt: 2,
                  }}
                >
                  Please login with student account to buy this course
                </Typography>
              )}
            </>
          )}
        </Stack>

        {/* Additional information */}
        <Box sx={{ pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography
            sx={{ fontWeight: 800, mb: 2.5, fontSize: "1rem", color: "text.primary" }}
          >
            Includes:
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: (theme) =>
                    alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.18 : 0.08,
                    ),
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PlayCircle size={16} color="currentColor" />
              </Box>
              <Typography sx={{ color: "text.primary", fontWeight: 500 }}>
                {lectures.length} lessons
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: (theme) =>
                    alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.18 : 0.08,
                    ),
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={16} color="currentColor" />
              </Box>
              <Typography sx={{ color: "text.primary", fontWeight: 500 }}>
                Lifetime learning materials
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: (theme) =>
                    alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.18 : 0.08,
                    ),
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Award size={16} color="currentColor" />
              </Box>
              <Typography sx={{ color: "text.primary", fontWeight: 500 }}>
                Certificate of completion
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
