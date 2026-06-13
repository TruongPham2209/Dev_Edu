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

  return (
    <CoursePurchaseCard
      course={course}
      isEnrolled={isEnrolled}
      lectures={lectures}
      handleBuyNow={handleBuyNow}
      handleAddToCart={handleAddToCart}
      loadingAction={loadingAction}
      showPurchase={showPurchase}
    />
  );
}
