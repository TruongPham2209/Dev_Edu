"use client";

import { CoursePurchaseCard } from "@/components/card/course-purchase-card";
import {
  useAddToCartMutation,
  useCheckoutMutation,
} from "@/lib/api/enrollments";
import type { CourseResponse } from "@/lib/type/courses";
import type { LectureResponse } from "@/lib/type/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { useAuth } from "@/lib/use-auth";
import { formatPrice } from "@/lib/util/date-utils";
import { Box, Button, Typography } from "@mui/material";
import { PlayCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CoursePurchaseSectionProps {
  course: CourseResponse;
  isEnrolled: boolean;
  lectures: LectureResponse[];
}

export function CoursePurchaseSection({
  course,
  isEnrolled,
  lectures,
}: CoursePurchaseSectionProps) {
  const { isAuthenticated, roles } = useAuth();
  const showPurchase = isAuthenticated && roles?.includes("STUDENT");
  const router = useRouter();
  const { handleError, showSuccess } = useApiWithToast();
  const [loadingAction, setLoadingAction] = useState<"buy" | "cart" | null>(
    null,
  );
  const { mutateAsync: addToCartMutate } = useAddToCartMutation();
  const { mutateAsync: checkoutMutate } = useCheckoutMutation();

  const handleBuyNow = async () => {
    if (!showPurchase) {
      router.push(`/login?redirect=/courses/${course.id}`);
      return;
    }
    setLoadingAction("buy");
    try {
      const res = await checkoutMutate({
        entityIds: [course.id],
        entityType: "COURSE",
      });
      router.push(`/checkout?orderId=${res.orderId}`);
    } catch (error) {
      handleError(error, "Could not initiate checkout");
      setLoadingAction(null);
    }
  };

  const handleAddToCart = async () => {
    setLoadingAction("cart");
    try {
      await addToCartMutate(course.id);
      showSuccess("Added to cart successfully");
    } catch (error) {
      handleError(error, "Could not add to cart");
    } finally {
      setLoadingAction(null);
    }
  };

  const isFree =
    course.originalPrice === 0 ||
    (course.discountedPercentage && course.discountedPercentage >= 100);
  const displayPrice =
    course.discountedPercentage && course.originalPrice
      ? course.originalPrice * (1 - course.discountedPercentage / 100)
      : course.originalPrice;

  return (
    <>
      <CoursePurchaseCard
        course={course}
        isEnrolled={isEnrolled}
        lectures={lectures}
        handleBuyNow={handleBuyNow}
        handleAddToCart={handleAddToCart}
        loadingAction={loadingAction}
        showPurchase={showPurchase}
      />

      {/* FIXED MOBILE BOTTOM ACTION BAR */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          px: 2.5,
          py: 1.25,
          bgcolor: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid rgba(255,255,255,0.15)",
          boxShadow: "0 -10px 25px rgba(0,0,0,0.3)",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "0.7rem",
              color: "#94a3b8",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Price
          </Typography>
          <Typography
            sx={{
              fontWeight: 900,
              color: isFree ? "#34d399" : "white",
              fontSize: "1.15rem",
              lineHeight: 1.1,
            }}
          >
            {isFree ? "Free" : `${displayPrice ? formatPrice(displayPrice) : "0"}đ`}
          </Typography>
        </Box>

        <Box sx={{ flex: 1, maxWidth: 220 }}>
          {isEnrolled ? (
            <Button
              component={Link}
              href={`/courses/${course.id}/lectures`}
              variant="contained"
              fullWidth
              size="medium"
              startIcon={<PlayCircle size={18} />}
              sx={{
                py: 1,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: "0.875rem",
                background: "linear-gradient(to right, #3b82f6, #6366f1)",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
              }}
            >
              Start Learning
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              size="medium"
              onClick={handleBuyNow}
              disabled={loadingAction !== null || !showPurchase}
              sx={{
                py: 1,
                borderRadius: 2.5,
                fontWeight: 800,
                fontSize: "0.875rem",
                background: "linear-gradient(to right, #e11d48, #be123c)",
                textTransform: "none",
                boxShadow: "0 4px 14px rgba(225, 29, 72, 0.4)",
              }}
            >
              Register Now
            </Button>
          )}
        </Box>
      </Box>
    </>
  );
}
