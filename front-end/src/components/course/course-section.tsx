"use client";

import { EmptyState } from "@/components/common/empty-state";
import { InfiniteLoadButton } from "@/components/common/infinite-load-button";
import { SkeletonCard } from "@/components/common/skeleton-card";
import { CourseCard } from "@/components/course/course-card";
import { getCourses } from "@/lib/api/courses";
import type { CourseResponse } from "@/lib/api/types";
import { Box, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

export function CourseSection({
  title,
  categoryId,
  keyword,
  highlight = false,
}: {
  title: string;
  categoryId?: string;
  keyword?: string;
  highlight?: boolean;
}) {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const loadCourses = useCallback(
    async (cursor?: string) => {
      setLoading(true);
      try {
        const response = highlight
          ? null
          : await getCourses({
              categoryId,
              keyword,
              nextCursor: cursor,
            });

        if (response) {
          setCourses((prev) =>
            cursor ? [...prev, ...response.contents] : response.contents,
          );
          setNextCursor(response.nextCursor ?? undefined);
          setHasMore(Boolean(response.nextCursor));
        }
      } catch (error) {
        console.error("Failed to load courses", error);
        if (!cursor) {
          setCourses([]);
        }
        setNextCursor(undefined);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [categoryId, keyword, highlight],
  );

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const gridStyles = {
    display: "grid",
    gridTemplateColumns: {
      xs: "1fr",
      sm: "repeat(2, 1fr)",
      md: "repeat(3, 1fr)",
      lg: "repeat(4, 1fr)",
      xl: "repeat(5, 1fr)",
    },
    gap: 3,
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        {title}
      </Typography>
      {loading && courses.length === 0 ? (
        <Box sx={gridStyles}>
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </Box>
      ) : courses.length === 0 ? (
        <EmptyState title="Chưa có khóa học" subtitle="Hãy quay lại sau." />
      ) : (
        <Box sx={gridStyles}>
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </Box>
      )}
      <InfiniteLoadButton
        loading={loading}
        hasMore={hasMore}
        onLoadMore={() => loadCourses(nextCursor)}
      />
    </Box>
  );
}
