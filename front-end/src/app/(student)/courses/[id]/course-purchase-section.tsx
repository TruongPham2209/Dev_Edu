"use client";

import { CoursePurchaseCard } from "@/components/card/course-purchase-card";
import { useAddToCartMutation } from "@/lib/api/enrollments";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import type { CourseResponse } from "@/lib/type/courses";
import type { LectureResponse } from "@/lib/type/lectures";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CoursePurchaseSectionProps {
  course: CourseResponse;
  isEnrolled: boolean;
  lectures: LectureResponse[];
  isLoggedIn: boolean;
}

export function CoursePurchaseSection({
  course,
  isEnrolled,
  lectures,
  isLoggedIn,
}: CoursePurchaseSectionProps) {
  const router = useRouter();
  const { handleError, showSuccess } = useApiWithToast();
  const [loadingAction, setLoadingAction] = useState<"buy" | "cart" | null>(null);
  const { mutateAsync: addToCartMutate } = useAddToCartMutation();

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/courses/${course.id}`);
      return;
    }
    router.push(`/checkout`);
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
      isLoggedIn={isLoggedIn}
    />
  );
}
