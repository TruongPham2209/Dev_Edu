"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Stack,
  Skeleton,
  CircularProgress,
  Typography,
  Snackbar,
  Button,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
  getCartItems,
  removeFromCart,
  createPurchase,
} from "@/lib/api/enrollments";
import type { CourseItemDetailResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { EmptyState } from "@/components/common/empty-state";
import { CourseOrderItem } from "./course-order-item";
import { CartSummaryCard } from "./cart-summary-card";
import { ShoppingCart } from "lucide-react";

export function CartTabContent() {
  const router = useRouter();
  const { handleError } = useApiWithToast();

  const [items, setItems] = useState<CourseItemDetailResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  // Undo delete functionality
  const [pendingDeletes, setPendingDeletes] = useState<Set<string>>(new Set());
  const [lastDeletedItem, setLastDeletedItem] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const deleteTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const observerTarget = useRef(null);

  const loadData = useCallback(
    async (isLoadMore = false) => {
      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      try {
        const data = await getCartItems(isLoadMore ? nextCursor : undefined);
        setItems((prev) =>
          isLoadMore ? [...prev, ...data.contents] : data.contents,
        );
        setNextCursor(data.nextCursor ?? undefined);
        setHasMore(!!data.nextCursor);
      } catch (error) {
        handleError(error, "Không thể tải dữ liệu giỏ hàng");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [nextCursor, handleError],
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadData(true);
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
  }, [hasMore, loading, loadingMore, loadData]);

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
        await removeFromCart(id);
        setItems((prev) => prev.filter((i) => (i.courseId || i.id) !== id));
      } catch (error) {
        handleError(error, "Xóa khỏi giỏ hàng thất bại");
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
      const res = await createPurchase({
        entityIds: purchaseIds,
        entityType: "COURSE",
        paymentMethod: "VNPAY", // Default or let checkout page handle
      });
      if (res.paymentId) {
        router.push(`/checkout?paymentId=${res.paymentId}`);
      }
    } catch (error) {
      handleError(error, "Không thể tạo đơn hàng");
      setIsCheckoutLoading(false);
    }
  };

  const visibleItems = items.filter(
    (item) => !pendingDeletes.has(item.courseId || item.id),
  );

  const selectedItemsData = visibleItems.filter((item) =>
    selectedIds.has(item.courseId || item.id),
  );
  const totalPrice = selectedItemsData.reduce(
    (acc, curr) => acc + (curr.discountedPrice ?? 0),
    0,
  );

  if (loading) {
    return (
      <Stack spacing={3} sx={{ flex: 1, minWidth: 0, pb: 10 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={180}
            sx={{ borderRadius: 4 }}
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
        <ShoppingCart
          size={48}
          color="#94a3b8"
          style={{ margin: "0 auto 16px" }}
        />
        <EmptyState
          title="Giỏ hàng trống"
          subtitle="Khám phá các khóa học hấp dẫn và thêm vào giỏ hàng nhé."
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
          Khám phá khóa học
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
            mb: 3,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, color: "#334155", fontSize: "1.25rem" }}
          >
            Tất cả ({visibleItems.length} khóa học)
          </Typography>
          <Button
            size="small"
            sx={{ textTransform: "none", fontWeight: 700 }}
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
              ? "Bỏ chọn tất cả"
              : "Chọn tất cả"}
          </Button>
        </Box>

        <Stack spacing={3}>
          {visibleItems.map((item) => (
            <CourseOrderItem
              key={item.courseId || item.id}
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
        totalPrice={totalPrice}
        onCheckout={handleCheckout}
        isCheckoutLoading={isCheckoutLoading}
      />

      {/* Undo Snackbar */}
      <Snackbar
        open={Boolean(lastDeletedItem)}
        message={`Đã xóa "${lastDeletedItem?.title}"`}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{ bottom: { xs: 120, sm: 100 } }} // Move above the bottom bar
        action={
          <Button
            color="primary"
            size="small"
            onClick={handleUndo}
            sx={{ fontWeight: 700 }}
          >
            Hoàn tác
          </Button>
        }
      />
    </Box>
  );
}
