"use client";

import { CourseManageCard } from "@/components/card/course-manage-card";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import {
  FilterItem,
  FilterSelect,
} from "@/components/common/form/filter-select";
import { SearchInput } from "@/components/common/form/search-input";
import { useDebounce } from "@/hooks/use-debounce";
import {
  useAssignedCoursesInfiniteQuery,
  useCategoriesQuery,
} from "@/lib/api/courses";
import { Box, Container, Stack, Typography } from "@mui/material";
import { LayoutGrid, RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CourseManageGridSkeleton } from "./course-manage-grid-skeleton";

export default function LecturerDashboardPage() {
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");

  const debouncedKeyword = useDebounce(keyword, 500);
  const debouncedCategoryId = useDebounce(categoryId, 500);

  const { data: categoriesData } = useCategoriesQuery();

  const {
    data: coursesData,
    isLoading: loadingCourses,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
    error: coursesError,
    refetch: refetchCourses,
  } = useAssignedCoursesInfiniteQuery(
    debouncedKeyword || undefined,
    debouncedCategoryId !== "ALL" ? debouncedCategoryId : undefined,
  );

  const courses = coursesData?.pages.flatMap((page) => page.contents) || [];
  const nextCursor = hasNextPage ? "has_more" : null;

  const categoryItems: FilterItem[] =
    categoriesData?.map((cat) => ({
      id: cat.id,
      title: cat.name,
    })) || [];

  // Intersection observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !loadingMore &&
          !loadingCourses
        ) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, loadingMore, loadingCourses, fetchNextPage]);

  const handleRetry = () => {
    refetchCourses();
  };

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3, md: 4 } }}
    >
      <Stack spacing={3}>
        {/* Management Header Section */}
        <Box
          sx={{
            pt: 1,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "rgba(15, 23, 42, 0.08)",
          }}
        >
          {/* Breadcrumb / Context */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 2, alignItems: "center" }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#94a3b8", fontWeight: 600 }}
            >
              Lecturer
            </Typography>
            <Typography variant="caption" sx={{ color: "#cbd5e1" }}>
              /
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "primary.main", fontWeight: 700 }}
            >
              Assigned Courses
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
              gap: { xs: 2, md: 3 },
            }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ mb: 1, alignItems: "center" }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: "rgba(37, 99, 235, 0.05)",
                    color: "primary.main",
                    display: "flex",
                  }}
                >
                  <LayoutGrid size={24} />
                </Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "#0f172a",
                    fontSize: { xs: "1.35rem", sm: "1.65rem", md: "1.875rem" },
                  }}
                >
                  Assigned Courses
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: "#64748b",
                  lineHeight: 1.6,
                  maxWidth: { xs: "100%", md: 600 },
                  fontSize: { xs: "0.825rem", sm: "0.875rem" },
                }}
              >
                The teaching content coordination and management system. Here
                you can track the list, update lectures and monitor the
                activities of students.
              </Typography>
            </Box>

            {/* Search bar */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              sx={{ width: { xs: "100%", md: "auto" } }}
            >
              <SearchInput
                value={keyword}
                onChange={(val) => setKeyword(val)}
                onSearch={(val) => setKeyword(val)}
                placeholder="Search courses..."
                onClear={() => setKeyword("")}
                maxWidth={320}
              />
              <FilterSelect
                label="Category"
                value={categoryId}
                onChange={setCategoryId}
                items={categoryItems}
                defaultLabel="All Categories"
                defaultValue="ALL"
              />
            </Stack>
          </Box>
        </Box>

        {/* Content Section */}
        {coursesError ? (
          <ErrorState
            title="An error occurred"
            subtitle="Could not connect to the server. Please check your connection."
            onRetry={handleRetry}
          />
        ) : loadingCourses && courses.length === 0 ? (
          <CourseManageGridSkeleton />
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses assigned"
            subtitle="You don't have any courses assigned yet. When new courses are assigned, they will appear here."
            icon={<LayoutGrid size={48} />}
          />
        ) : (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(4, 1fr)",
                  xl: "repeat(5, 1fr)",
                },
                gap: { xs: 2, sm: 2.5 },
              }}
            >
              {courses.map((course) => {
                return (
                  <CourseManageCard
                    key={course.id}
                    title={course.title}
                    description={course.description}
                    thumbnailUrl={course.thumbnailUrl || ""}
                    createdAt={course.createdAt}
                    href={`/lecturer/courses/${course.id}`}
                  />
                );
              })}
            </Box>

            {/* Infinite Scroll Trigger */}
            <Box
              ref={observerTarget}
              sx={{
                py: 6,
                display: "flex",
                justifyContent: "center",
                opacity: nextCursor ? 1 : 0,
                pointerEvents: "none",
              }}
            >
              {loadingMore && (
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <RefreshCw size={24} className="animate-spin text-primary" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Loading courses ...
                  </Typography>
                </Stack>
              )}
            </Box>
          </>
        )}
      </Stack>
    </Container>
  );
}
