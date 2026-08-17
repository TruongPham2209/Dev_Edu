"use client";

import { EmptyState } from "@/components/common/empty-state";
import { useEnrollmentsInfiniteQuery } from "@/lib/api/enrollments";
import {
  Box,
  Button,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { CourseOrderItem } from "../cart/course-order-item";

export function EnrollmentList() {
  const router = useRouter();

  const observerTarget = useRef(null);

  // React Query Hook
  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage: hasMore,
    fetchNextPage: fetchNext,
  } = useEnrollmentsInfiniteQuery();

  const items = useMemo(() => {
    return data?.pages.flatMap((page) => page.contents) || [];
  }, [data]);

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

  if (loading) {
    return (
      <Stack spacing={2.5} sx={{ flex: 1, minWidth: 0, pb: { xs: 6, sm: 10 } }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={160}
            sx={{ borderRadius: 2 }}
          />
        ))}
      </Stack>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        sx={{
          py: { xs: 6, sm: 10 },
          px: { xs: 2, sm: 4 },
          textAlign: "center",
          bgcolor: "#f8fafc",
          borderRadius: { xs: 3, sm: 4 },
          border: "1px dashed #cbd5e1",
        }}
      >
        <EmptyState
          title="No courses enrolled"
          subtitle="You haven't enrolled in any courses yet. Explore exciting courses and start learning today!"
          icon={<BookOpen size={32} />}
        />
        <Button
          variant="contained"
          onClick={() => router.push("/courses")}
          sx={{
            mt: 3,
            borderRadius: 50,
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.2 },
            fontSize: { xs: "0.875rem", sm: "0.95rem" },
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
        gap: { xs: 3, lg: 6 },
        pb: { xs: 6, sm: 10 },
      }}
    >
      {/* Left Column: Items */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack spacing={3}>
          {items.map((item) => (
            <CourseOrderItem key={item.id} item={item} tabContext="enrolled" />
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
