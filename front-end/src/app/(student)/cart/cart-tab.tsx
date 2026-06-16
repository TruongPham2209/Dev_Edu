"use client";

import { EmptyState } from "@/components/common/empty-state";
import {
  useCartItemsInfiniteQuery,
  useCheckoutMutation,
  useRemoveFromCartMutation,
} from "@/lib/api/enrollments";
import type { CourseItemDetailResponse } from "@/lib/type/enrollments";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CartSummaryCard } from "./cart-summary-card";
import { CourseOrderItem } from "./course-order-item";

export function CartTabContent() {
  const router = useRouter();
  const { handleError } = useApiWithToast();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Undo delete functionality
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [lastDeletedItem, setLastDeletedItem] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const deleteTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const observerTarget = useRef(null);

  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage: hasMore,
    fetchNextPage: fetchNext,
    refetch: refetchCart,
  } = useCartItemsInfiniteQuery();

  const { mutateAsync: removeFromCartMutate } = useRemoveFromCartMutation();
  const { mutateAsync: createCheckoutMutate } = useCheckoutMutation();

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page.contents) || [];
  }, [data]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchNext();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading, loadingMore, fetchNext]);

  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (checked) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const handleRemoveClick = (item: CourseItemDetailResponse) => {
    const id = item.courseId || item.id;
    // Hide item instantly
    setPendingDeletes((prev) => new Set(prev).add(id));
    setLastDeletedItem({ id, title: item.title });

    // Remove from selected if selected
    if (selectedIds.has(id)) {
      handleSelect(id, false);
    }

    // Start 4s timer to permanently delete
    const timeout = setTimeout(async () => {
      try {
        await removeFromCartMutate(id);
        refetchCart();
      } catch (error) {
        handleError(error, "Failed to remove from cart");
      } finally {
        setPendingDeletes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
        setLastDeletedItem(null);
      }
    }, 4000);

    deleteTimeouts.current[id] = timeout;
  };

  const handleUndo = () => {
    if (!lastDeletedItem) return;
    const id = lastDeletedItem.id;

    // Clear timeout
    if (deleteTimeouts.current[id]) {
      clearTimeout(deleteTimeouts.current[id]);
      delete deleteTimeouts.current[id];
    }

    // Restore visibility
    setPendingDeletes((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
    setLastDeletedItem(null);
  };

  const handleCheckout = async () => {
    if (selectedIds.size === 0) return;
    setIsCheckoutLoading(true);
    try {
      const purchaseIds = Array.from(selectedIds);
      const res = await createCheckoutMutate({
        entityIds: purchaseIds,
        entityType: "COURSE",
      });
      if (res.orderId) {
        router.push(`/checkout?orderId=${res.orderId}`);
      }
    } catch (error) {
      handleError(error, "Failed to create order");
      setIsCheckoutLoading(false);
    }
  };

  const visibleItems = items.filter(
    (item) => !pendingDeletes.has(item.courseId || item.id),
  );

  const selectedItemsData = visibleItems.filter((item) =>
    selectedIds.has(item.courseId || item.id),
  );

  const totalFinalPrice = selectedItemsData.reduce(
    (acc, curr) => acc + (curr.discountedPrice ?? 0),
    0,
  );

  const totalOriginalPrice = selectedItemsData.reduce(
    (acc, curr) => acc + (curr.originalPrice ?? curr.discountedPrice ?? 0),
    0,
  );

  const totalDiscountAmount = totalOriginalPrice - totalFinalPrice;

  if (loading) {
    return (
      <Stack spacing={3} sx={{ flex: 1, minWidth: 0, pb: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={180}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Stack>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        sx={{
          py: 10,
          textAlign: "center",
          bgcolor: "#f8fafc",
          borderRadius: 4,
          border: "1px dashed #cbd5e1",
        }}
      >
        <EmptyState
          title="Cart is empty"
          subtitle="Explore exciting courses and add them to your cart."
          icon={<ShoppingCart size={32} />}
        />
        <Button
          variant="contained"
          onClick={() => router.push("/courses")}
          sx={{
            mt: 3,
            borderRadius: 50,
            textTransform: "none",
            fontWeight: 700,
          }}
        >
          Explore courses
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 4, lg: 6 },
        pb: 15, // Extra padding for the bottom bar
      }}
    >
      {/* Left Column: Items */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Button
            size="small"
            sx={{ textTransform: "none", fontWeight: 700, py: 1, px: 1.5 }}
            onClick={() => {
              if (selectedIds.size === visibleItems.length) {
                setSelectedIds(new Set());
              } else {
                setSelectedIds(
                  new Set(visibleItems.map((i) => i.courseId || i.id)),
                );
              }
            }}
          >
            {selectedIds.size === visibleItems.length && visibleItems.length > 0
              ? "Deselect all"
              : "Select all"}
          </Button>
        </Box>

        <Stack spacing={3}>
          {visibleItems.map((item) => (
            <CourseOrderItem
              key={item.id}
              item={item}
              tabContext="cart"
              selected={selectedIds.has(item.courseId || item.id)}
              onSelect={handleSelect}
              onRemove={() => handleRemoveClick(item)}
            />
          ))}
        </Stack>

        {hasMore && (
          <Box
            ref={observerTarget}
            sx={{ py: 4, display: "flex", justifyContent: "center" }}
          >
            {loadingMore ? (
              <CircularProgress size={30} sx={{ color: "#0284c7" }} />
            ) : (
              <Typography variant="body2" sx={{ color: "transparent" }}>
                .
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Fixed Bottom Summary Bar */}
      <CartSummaryCard
        totalItems={selectedIds.size}
        totalOriginalPrice={totalOriginalPrice}
        totalDiscountAmount={totalDiscountAmount}
        totalFinalPrice={totalFinalPrice}
        onCheckout={handleCheckout}
        isCheckoutLoading={isCheckoutLoading}
      />

      {/* Undo Snackbar */}
      <Snackbar
        open={Boolean(lastDeletedItem)}
        message={`Deleted "${lastDeletedItem?.title}"`}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ bottom: { xs: 120, sm: 100 } }} // Move above the bottom bar
        action={
          <Button
            color="primary"
            size="small"
            onClick={handleUndo}
            sx={{ fontWeight: 700 }}
          >
            Undo
          </Button>
        }
      />
    </Box>
  );
}
