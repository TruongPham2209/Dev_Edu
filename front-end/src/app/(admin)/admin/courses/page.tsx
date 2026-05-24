"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/filter-select";
import { HeroInfo } from "@/components/common/hero-info";
import { ImagePreview } from "@/components/common/image-preview";
import { SearchInput } from "@/components/common/search-input";
import { CourseFormDialog } from "@/components/dialog/course-form";
import {
  createCourse,
  deleteCourse,
  getCategories,
  getCourses,
  updateCourse,
} from "@/lib/api/courses";
import { confirmImageUpload, getPreSignedUploadUrl } from "@/lib/api/files";
import type {
  CategoryResponse,
  CourseRequest,
  CourseResponse,
} from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Stack } from "@mui/material";
import { BookOpen, Plus, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CourseTable } from "./course-table";

export default function AdminCoursesPage() {
  const router = useRouter();
  const { handleError, showSuccess } = useApiWithToast();

  // Data States
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(false);

  // Submitting States
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  // Server Pagination States
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Load categories EXACTLY ONCE on initial load
  const loadCategories = async () => {
    try {
      const data = await getCategories("ACTIVE");
      setCategories(data);
    } catch (error) {
      handleError(error, "Không thể tải danh mục");
    }
  };

  // Modern server-side fetch courses
  const fetchCourses = async (
    targetPage = page,
    targetCategoryId = categoryFilter,
    targetKeyword = query,
  ) => {
    setLoading(true);
    setCoursesError(false);
    try {
      const params: Parameters<typeof getCourses>[0] = {
        page: targetPage,
      };

      // Only search when keyword is not blank; otherwise load category / default view
      if (targetKeyword.trim() !== "") {
        params.keyword = targetKeyword.trim();
        // Hide category option bar and bypass categoryId parameter
      } else if (targetCategoryId !== "ALL") {
        params.categoryId = targetCategoryId;
      }

      const response = await getCourses(params);
      setCourses(response.contents);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setPage(response.currentPage);
    } catch (error) {
      setCoursesError(true);
      handleError(error, "Không thể tải khóa học");
    } finally {
      setLoading(false);
    }
  };

  // Perform initial mount fetching
  useEffect(() => {
    loadCategories();
    fetchCourses(0, "ALL", "");
  }, []);

  // Handle pagination navigation
  const handlePageChange = (nextPage: number) => {
    if (nextPage < 0 || nextPage >= totalPages || loading) return;
    setPage(nextPage);
    fetchCourses(nextPage, categoryFilter, query);
  };

  // Handle Category Filter change
  const handleCategorySelect = (categoryId: string) => {
    setCategoryFilter(categoryId);
    setQuery(""); // Do NOT send keyword simultaneously
    setPage(0);
    fetchCourses(0, categoryId, "");
  };

  // Handle Search Keyword execution
  const handleSearch = (keyword: string) => {
    setQuery(keyword);
    setPage(0);
    fetchCourses(0, "ALL", keyword); // Do NOT send categoryId simultaneously
  };

  // Handle Search Reset console action
  const handleResetSearch = () => {
    setQuery("");
    setCategoryFilter("ALL");
    setPage(0);
    // Restores original category options and reloads data under categoryFilter
    fetchCourses(0, "ALL", "");
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
    if (saving) return; // Prevent duplicate requests
    setSaving(true);
    try {
      let finalThumbnailObjectKey = payload.thumbnailObjectKey;

      // Handle new uploaded image direct file-presign upload flow
      if (selectedFile) {
        const preSignRes = await getPreSignedUploadUrl({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
          isPublic: true,
        });

        if (!preSignRes.uploadUrl || !preSignRes.objectKey) {
          throw new Error("Không thể lấy URL tải lên.");
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
        await confirmImageUpload(preSignRes.objectKey);
        finalThumbnailObjectKey = preSignRes.objectKey;
      }

      const finalPayload: CourseRequest = {
        ...payload,
        thumbnailObjectKey: finalThumbnailObjectKey,
      };

      if (editingCourse) {
        await updateCourse(finalPayload);
        showSuccess("Cập nhật khóa học thành công");
      } else {
        await createCourse(finalPayload);
        showSuccess("Tạo khóa học thành công");
      }
      setDialogOpen(false);
      // Reload current list keeping filter/search status
      fetchCourses(page, categoryFilter, query);
    } catch (error) {
      handleError(error, "Không thể lưu khóa học");
    } finally {
      setSaving(false);
    }
  };

  // Delete execution handling
  const handleDelete = async () => {
    if (!confirmId || deleting) return;
    setDeleting(true);
    try {
      await deleteCourse(confirmId);
      showSuccess("Đã xóa khóa học thành công");
      setConfirmId(null);
      // Reload page from 0 on delete success
      fetchCourses(0, categoryFilter, query);
    } catch (error) {
      handleError(error, "Không thể xóa khóa học");
    } finally {
      setDeleting(false);
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
            mb: 3,
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
            }}
          >
            {/* Search Input Container */}
            <Box
              sx={{
                flex: 1,
                minWidth: { xs: "100%", md: 320 },
                maxWidth: 500,
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

          {/* Right Side: Create Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 56, // Matches SearchInput minHeight
              gap: 1,
            }}
          >
            <ButtonAction
              variant="soft"
              color="info"
              tooltip="Tải lại dữ liệu"
              onClick={() => fetchCourses(page, categoryFilter, query)}
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
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          onPageChange={handlePageChange}
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
                onRetry={() => fetchCourses(page, categoryFilter, query)}
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
            ? `Đang thực hiện xóa khóa học "${courses.find((c) => c.id === confirmId)?.title || ""}"...`
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
