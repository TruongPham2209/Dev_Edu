"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Stack,
  Skeleton,
  CircularProgress,
  Typography,
} from "@mui/material";
import type { CourseItemDetailResponse } from "@/lib/api/types";
import { EmptyState } from "@/components/common/empty-state";
import { CourseOrderItem } from "./course-order-item";
import { PackageOpen } from "lucide-react";

const MOCK_ORDERS: CourseItemDetailResponse[] = [
  {
    id: "mock-order-1",
    courseId: "c1",
    title: "Khóa học React.js từ cơ bản đến nâng cao",
    description: "Học cách xây dựng ứng dụng web hiện đại với React.js",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=300&auto=format&fit=crop",
    originalPrice: 1500000,
    discountedPrice: 990000,
    timestamp: "2024-05-10T10:00:00Z",
    status: "COMPLETED",
  },
  {
    id: "mock-order-2",
    courseId: "c2",
    title: "Node.js & Express cho người mới bắt đầu",
    description:
      "Học cách xây dựng ứng dụng web hiện đại với Node.js và Express",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop",
    originalPrice: 1200000,
    discountedPrice: 850000,
    timestamp: "2024-04-25T14:30:00Z",
    status: "COMPLETED",
  },
];

export function PurchaseHistoryTabContent() {
  const [items, setItems] = useState<CourseItemDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const observerTarget = useRef(null);

  const loadData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    // Mock API call
    setTimeout(() => {
      if (!isLoadMore) {
        setItems(MOCK_ORDERS);
        setHasMore(false); // No more data in mock
      }
      setLoading(false);
      setLoadingMore(false);
    }, 800);
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <PackageOpen
          size={48}
          color="#94a3b8"
          style={{ margin: "0 auto 16px" }}
        />
        <EmptyState
          title="Chưa có đơn hàng"
          subtitle="Bạn chưa thực hiện giao dịch nào."
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 4, lg: 6 },
        pb: 10,
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
            Lịch sử mua hàng
          </Typography>
        </Box>

        <Stack spacing={3}>
          {items.map((item) => (
            <CourseOrderItem key={item.id} item={item} tabContext="order" />
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
    </Box>
  );
}
