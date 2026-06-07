"use client";

import { useGetCategories, useGetInfiniteCourses } from "@/lib/api/courses";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { CourseCategories } from "./course-categories";
import { CourseList } from "./course-list";
import { CourseSearch } from "./course-search";

export default function CourseDetailPage() {
  const { handleError } = useApiWithToast();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Use React Query
  const { data: categoriesData, error: catError } = useGetCategories();

  const {
    data: coursesData,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
    error: coursesError,
  } = useGetInfiniteCourses({
    keyword: debouncedKeyword || undefined,
    categoryId: selectedCategory || undefined,
  });

  const categories = categoriesData || [];
  const courses = coursesData?.pages.flatMap((page) => page.contents) || [];
  const nextCursor = hasNextPage ? "has_more" : null; // course-list expects nextCursor to be truthy to show load more

  useEffect(() => {
    if (catError) handleError(catError, "Failed to fetch categories");
    if (coursesError) handleError(coursesError, "Failed to fetch courses");
  }, [catError, coursesError, handleError]);

  const handleLoadMore = () => {
    if (hasNextPage && !loadingMore) {
      fetchNextPage();
    }
  };

  return (
    <Stack spacing={0} sx={{ pb: 10 }}>
      <CourseSearch
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        setDebouncedKeyword={setDebouncedKeyword}
      />

      <CourseCategories
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      <CourseList
        courses={courses}
        loading={loading}
        initialLoad={loading}
        nextCursor={nextCursor}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        onClearFilters={() => {
          setSearchKeyword("");
          setDebouncedKeyword("");
          setSelectedCategory(null);
        }}
      />
    </Stack>
  );
}
