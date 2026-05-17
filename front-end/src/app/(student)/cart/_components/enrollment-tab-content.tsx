"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Box, Stack, Skeleton, CircularProgress, Typography, Button } from "@mui/material";
import { getEnrollments } from "@/lib/api/enrollments";
import type { CourseItemDetailResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { EmptyState } from "@/components/common/empty-state";
import { CourseOrderItem } from "./course-order-item";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export function EnrollmentTabContent() {
  const router = useRouter();
  const { handleError } = useApiWithToast();

  const [items, setItems] = useState<CourseItemDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const observerTarget = useRef(null);

  const loadData = useCallback(async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const data = await getEnrollments(isLoadMore ? nextCursor : undefined);
      setItems(prev => isLoadMore ? [...prev, ...data.contents] : data.contents);
      setNextCursor(data.nextCursor ?? undefined);
      setHasMore(!!data.nextCursor);
    } catch (error) {
      handleError(error, "Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [nextCursor, handleError]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadData(true);
        }
      },
      { threshold: 1.0 }
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
      <Box sx={{ py: 10, textAlign: "center", bgcolor: "#f8fafc", borderRadius: 4, border: "1px dashed #cbd5e1" }}>
        <BookOpen size={48} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
        <EmptyState title="Chưa có khóa học" subtitle="Bạn chưa đăng ký khóa học nào. Hãy khám phá và bắt đầu học tập ngay hôm nay!" />
        <Button variant="contained" onClick={() => router.push("/courses")} sx={{ mt: 3, borderRadius: 50, textTransform: "none", fontWeight: 700 }}>Khám phá khóa học</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 4, lg: 6 }, pb: 10 }}>
      {/* Left Column: Items */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#334155", fontSize: "1.25rem" }}>
            Đã đăng ký ({items.length} khóa học)
          </Typography>
        </Box>

        <Stack spacing={3}>
          {items.map(item => (
            <CourseOrderItem
              key={item.courseId || item.id}
              item={item}
              tabContext="enrolled"
            />
          ))}
        </Stack>

        {hasMore && (
          <Box ref={observerTarget} sx={{ py: 4, display: "flex", justifyContent: "center" }}>
            {loadingMore ? <CircularProgress size={30} sx={{ color: "#0284c7" }} /> : <Typography variant="body2" sx={{ color: "transparent" }}>.</Typography>}
          </Box>
        )}
      </Box>
    </Box>
  );
}
