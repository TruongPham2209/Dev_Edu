"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/form/filter-select";
import { SearchInput } from "@/components/common/form/search-input";
import { HeroInfo } from "@/components/common/hero-section/hero-info";
import { ImagePreview } from "@/components/common/image-preview";
import { CourseFormDialog } from "@/components/dialog/course-form";
import {
  useCategoriesQuery,
  useCoursesInfiniteQuery,
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useUpdateCourseMutation,
} from "@/lib/api/courses";
import {
  useConfirmImageUploadMutation,
  usePreSignedUploadUrlMutation,
} from "@/lib/api/files";
import type { CourseRequest, CourseResponse } from "@/lib/type/courses";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, CircularProgress, Stack } from "@mui/material";
import { BookOpen, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CourseTable } from "./course-table";

export default function AdminCoursesPage() {
  const { handleError, showSuccess } = useApiWithToast();

  // Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseResponse | null>(
    null,
  );
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // Preview Image State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Query & Filter States
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Observer target ref
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Queries & Mutations
  const { data: categories = [] } = useCategoriesQuery("ACTIVE");

  const queryParams = useMemo(() => {
    const params: {
      keyword?: string;
      categoryId?: string;
    } = {};

    if (query.trim() !== "") {
      params.keyword = query.trim();
    } else if (categoryFilter !== "ALL") {
      params.categoryId = categoryFilter;
    }
    return params;
  }, [query, categoryFilter]);

  const {
    data: coursesData,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
    error: coursesErrorObj,
    refetch: fetchCourses,
  } = useCoursesInfiniteQuery(queryParams);

  const courses = useMemo(() => {
    return coursesData?.pages.flatMap((page) => page.contents) ?? [];
  }, [coursesData]);

  const coursesError = Boolean(coursesErrorObj);

  const { mutateAsync: createCourseMutate } = useCreateCourseMutation();
  const { mutateAsync: updateCourseMutate } = useUpdateCourseMutation();
  const { mutateAsync: deleteCourseMutate, isPending: deleting } =
    useDeleteCourseMutation();
  const { mutateAsync: getPreSignedUrlMutate, isPending: saving } =
    usePreSignedUploadUrlMutation();
  const { mutateAsync: confirmImageUploadMutate } =
    useConfirmImageUploadMutation();

  // Load More Handler
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasNextPage) return;
    fetchNextPage();
  }, [loading, loadingMore, hasNextPage, fetchNextPage]);

  // Auto Infinite scroll using IntersectionObserver
  useEffect(() => {
    const currentTarget = observerTargetRef.current;
    if (!currentTarget || !hasNextPage || loading || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasNextPage, loading, loadingMore, handleLoadMore]);

  // Handle Category Filter change
  const handleCategorySelect = (categoryId: string) => {
    setCategoryFilter(categoryId);
    setQuery(""); // Do NOT send keyword simultaneously
  };

  // Handle Search Keyword execution
  const handleSearch = (keyword: string) => {
    setQuery(keyword);
  };

  // Handle Search Reset console action
  const handleResetSearch = () => {
    setQuery("");
    setCategoryFilter("ALL");
  };

  // Handle Create Course Trigger
  const handleCreateTrigger = () => {
    setEditingCourse(null);
    setDialogOpen(true);
  };

  // Form Submission handling (with direct S3 upload sequenced in Save)
  const handleSave = async (
    payload: CourseRequest,
    selectedFile: File | null,
  ) => {
    try {
      let finalThumbnailObjectKey = payload.thumbnailObjectKey;

      // Handle new uploaded image direct file-presign upload flow
      if (selectedFile) {
        const preSignRes = await getPreSignedUrlMutate({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
          isPublic: true,
        });

        if (!preSignRes.uploadUrl || !preSignRes.objectKey) {
          throw new Error("Failed to get presigned upload URL");
        }

        // Upload to pre-signed URL (PUT request to Amazon S3/Cloud Storage)
        await fetch(preSignRes.uploadUrl, {
          method: "PUT",
          body: selectedFile,
          headers: {
            "Content-Type": selectedFile.type,
          },
        });

        // Confirm upload
        await confirmImageUploadMutate(preSignRes.objectKey);
        finalThumbnailObjectKey = preSignRes.objectKey;
      }

      const finalPayload: CourseRequest = {
        ...payload,
        thumbnailObjectKey: finalThumbnailObjectKey,
      };

      if (editingCourse) {
        await updateCourseMutate(finalPayload);
        showSuccess("Update course successfully");
      } else {
        await createCourseMutate(finalPayload);
        showSuccess("Create course successfully");
      }
      setDialogOpen(false);
      fetchCourses();
    } catch (error) {
      handleError(error, "Failed to save course");
    }
  };

  // Delete execution handling
  const handleDelete = async () => {
    if (!confirmId || deleting) return;
    try {
      await deleteCourseMutate(confirmId);
      showSuccess("Deleted course successfully");
      setConfirmId(null);
      fetchCourses();
    } catch (error) {
      handleError(error, "Failed to delete course");
    }
  };

  // Initial dialog form values
  const initialFormState: CourseRequest = useMemo(() => {
    if (editingCourse) {
      return {
        id: editingCourse.id,
        categoryId: editingCourse.categoryId || "",
        title: editingCourse.title,
        description: editingCourse.description,
        price: editingCourse.originalPrice ?? 0,
        thumbnailObjectKey: editingCourse.thumbnailObjectKey,
        lecturerUsernames: editingCourse.lecturers ?? [],
      };
    }
    return {
      categoryId: "",
      title: "",
      description: "",
      price: 0,
      thumbnailObjectKey: "",
      lecturerUsernames: [],
    };
  }, [editingCourse]);

  return (
    <Stack spacing={4} sx={{ width: "100%" }}>
      {/* Hero / Console Header */}
      <HeroInfo
        title="Courses Management"
        description="A comprehensive management interface for administrators to oversee the course catalog. You can create new courses, update details, organize by categories, and track content performance."
        icon={<BookOpen size={28} />}
        tags={[
          "Search & Filter",
          "Create Course",
          "Update Course",
          "Delete Course",
          "Manage Content",
        ]}
      />

      {/* Courses Catalog Card Table */}
      <Stack spacing={3}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: { xs: 2, sm: 3 },
          }}
        >
          {/* Left Side: Search & Filter */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
              flex: 1,
              width: { xs: "100%", md: "auto" },
            }}
          >
            {/* Search Input Container */}
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "100%", sm: 260, md: 320 },
                maxWidth: { xs: "100%", md: 500 },
              }}
            >
              <SearchInput
                value={query}
                onChange={setQuery}
                onSearch={handleSearch}
                onClear={handleResetSearch}
                placeholder="Search courses by keyword..."
              />
            </Box>

            {/* Category Filter Select */}
            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              <FilterSelect
                label="Filter by Category"
                value={categoryFilter}
                onChange={handleCategorySelect}
                items={categories.map((cat) => ({
                  id: cat.id,
                  title: cat.name,
                }))}
                defaultLabel="All Categories"
                defaultValue="ALL"
              />
            </Box>
          </Box>

          {/* Right Side: Create Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "flex-end", sm: "center" },
              height: 56, // Matches SearchInput minHeight
              gap: 1,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <ButtonAction
              variant="soft"
              color="info"
              tooltip="Refresh"
              onClick={() => fetchCourses()}
              icon={<RefreshCw size={21} strokeWidth={2.3} />}
            />
            <ButtonAction
              tooltip="Create Course"
              onClick={handleCreateTrigger}
              icon={<Plus size={21} strokeWidth={2.3} />}
            />
          </Box>
        </Box>

        {/* Core responsive table rendering */}
        <CourseTable
          courses={courses}
          loading={loading || loadingMore}
          onPreviewImage={setPreviewImage}
          onEditCourse={(course) => {
            setEditingCourse(course);
            setDialogOpen(true);
          }}
          onDeleteCourse={setConfirmId}
          errorState={
            coursesError ? (
              <ErrorState
                title="Failed to load courses"
                subtitle="An error occurred while connecting to the system. Please try again later."
                onRetry={() => fetchCourses()}
                actionLabel="Refresh"
              />
            ) : undefined
          }
          emptyState={
            <EmptyState
              title="No courses found"
              subtitle={
                query
                  ? `We couldn't find any courses matching search "${query}"`
                  : "Get started by publishing your very first course to the student catalog."
              }
              actionLabel={query ? undefined : "Create Course"}
              onAction={query ? undefined : handleCreateTrigger}
            />
          }
        />

        {/* Hidden trigger for IntersectionObserver to load more when scrolling */}
        {hasNextPage && (
          <Box
            ref={observerTargetRef}
            sx={{
              height: 20,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              mt: 2,
            }}
          >
            {loadingMore && <CircularProgress size={24} />}
          </Box>
        )}
      </Stack>

      {/* Reusable Form Dialog for Create & Update */}
      <CourseFormDialog
        open={dialogOpen}
        title={editingCourse ? "Update course" : "Create course"}
        categories={categories}
        initialValue={initialFormState}
        editingCourse={editingCourse}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirmId)}
        title="Delete course?"
        description={
          deleting
            ? `Deleting course "${courses.find((c) => c.id === confirmId)?.title || ""}"...`
            : `Are you sure you want to delete the course "${courses.find((c) => c.id === confirmId)?.title || ""}"? This action is permanent and cannot be undone.`
        }
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        onConfirm={handleDelete}
        onCancel={() => setConfirmId(null)}
      />

      {/* Image Preview Overlay */}
      <ImagePreview
        src={previewImage}
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
      />
    </Stack>
  );
}
