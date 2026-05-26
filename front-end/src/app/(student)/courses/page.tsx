"use client";

import { getCategories, getCourses } from "@/lib/api/courses";
import type { CategoryResponse, CourseResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { CourseCategories } from "./course-categories";
import { CourseList } from "./course-list";
import { CourseSearch } from "./course-search";

export default function CourseDetailPage() {
  const { handleError } = useApiWithToast();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);

  // Loading states
  const [initialLoad, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Pagination
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  // Load categories
  useEffect(() => {
    const loadCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        handleError(error, "Không thể tải danh mục");
      }
    };
    loadCats();
  }, [handleError]);

  // Load courses when filters change
  useEffect(() => {
    let isMounted = true;

    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await getCourses({
          keyword: debouncedKeyword || undefined,
          categoryId: selectedCategory || undefined,
        });

        if (isMounted) {
          setCourses(response.contents);
          setNextCursor(response.nextCursor ?? null);
        }
      } catch (error) {
        if (isMounted) handleError(error, "Không thể tải khóa học");
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    fetchCourses();

    return () => {
      isMounted = false;
    };
  }, [debouncedKeyword, selectedCategory, handleError]);

  // Load more
  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;

    setLoadingMore(true);
    try {
      const response = await getCourses({
        keyword: debouncedKeyword || undefined,
        categoryId: selectedCategory || undefined,
        nextCursor: nextCursor,
      });

      setCourses((prev) => [...prev, ...response.contents]);
      setNextCursor(response.nextCursor ?? null);
    } catch (error) {
      handleError(error, "Could not load more courses");
    } finally {
      setLoadingMore(false);
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
        initialLoad={initialLoad}
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
