"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { HeroInfo } from "@/components/common/hero-info";
import { ImagePreview } from "@/components/common/image-preview";
import { CategoryFormDialog } from "@/components/dialog/category-form";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/lib/api/courses";
import { getPreSignedUploadUrl } from "@/lib/api/files";
import type { CategoryRequest, CategoryResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Button,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDown, FolderPlus, Layers, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { CategoryTable } from "./category-table";

export default function AdminCategoriesPage() {
  const { handleError, showSuccess } = useApiWithToast();

  // Data State
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true); // Initialize as true to ensure Skeleton displays immediately, eliminating EmptyState flashes
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Dialog Form State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);

  // Delete State
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  // Client-side Load More pagination controls
  const [rowsToShow, setRowsToShow] = useState(5);
  const [loadingMore, setLoadingMore] = useState(false);

  // Preview Image State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoryData = await getCategories("ACTIVE");
      setCategories(categoryData);
    } catch (err: any) {
      setError("Failed to load categories. Please try again later.");
      handleError(err, "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openDialog = (category?: CategoryResponse) => {
    if (category) {
      setEditing(category);
    } else {
      setEditing(null);
    }
    setDialogOpen(true);
  };

  const handleSave = async (
    form: CategoryRequest,
    selectedFile: File | null,
  ) => {
    setSaving(true);
    try {
      let finalThumbnailObjectKey = form.thumbnailObjectKey;

      // Handle S3/R2 direct upload workflow if new branding asset is selected
      if (selectedFile) {
        const preSignRes = await getPreSignedUploadUrl({
          fileName: selectedFile.name,
          contentType: selectedFile.type,
          fileSize: selectedFile.size,
          isPublic: true,
        });

        if (!preSignRes.uploadUrl || !preSignRes.objectKey) {
          throw new Error("Failed to get presigned upload URL.");
        }

        await fetch(preSignRes.uploadUrl, {
          method: "PUT",
          body: selectedFile,
          headers: {
            "Content-Type": selectedFile.type,
          },
        });

        finalThumbnailObjectKey = preSignRes.objectKey;
      }

      const payload: CategoryRequest = {
        ...form,
        thumbnailObjectKey: finalThumbnailObjectKey,
      };

      if (editing) {
        await updateCategory(payload);
        showSuccess("Category updated successfully");
      } else {
        await createCategory(payload);
        showSuccess("Category created successfully");
      }

      setDialogOpen(false);
      loadCategories();
    } catch (err) {
      handleError(err, "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmId || deleting) return;
    setDeleting(true);
    try {
      await deleteCategory(confirmId);
      showSuccess("Category deleted successfully");
      setConfirmId(null);
      loadCategories();
    } catch (err) {
      handleError(err, "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  // Simulate smooth Load More client-side interaction
  const hasMore = categories.length > rowsToShow;
  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setRowsToShow((prev) => prev + 5);
      setLoadingMore(false);
    }, 500); // 500ms artificial delay for high fidelity feedback
  };

  return (
    <Stack spacing={3} sx={{ width: "100%", overflowX: "hidden" }}>
      {/* Hero / Header Section */}
      <HeroInfo
        title="Category Management"
        description="Architect and organize the core learning taxonomy. Effortlessly create new classification branches, update existing directory structures, and manage the visual branding of the entire course catalog."
        icon={<Layers size={24} className="text-blue-400" />}
        tags={["Create Categories", "Update Content", "Manage Structure"]}
      />

      {/* Card Header with Button moved inside */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          Total categories: {categories.length}
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <ButtonAction
            tooltip="Tải lại dữ liệu"
            onClick={loadCategories}
            variant="soft"
            color="info"
            icon={<RefreshCw size={21} strokeWidth={2.3} />}
          />
          <ButtonAction
            tooltip="New Category"
            onClick={() => openDialog()}
            icon={<FolderPlus size={21} strokeWidth={2.3} />}
          />
        </Box>
      </Box>

      <CategoryTable
        categories={categories.slice(0, rowsToShow)}
        loading={loading || loadingMore}
        onEdit={(cat) => openDialog(cat)}
        onDelete={(id, name) => {
          setConfirmId(id);
          setDeleteTargetName(name);
        }}
        onPreviewImage={setPreviewImage}
        errorState={
          error ? (
            <ErrorState
              title="Không thể tải danh mục"
              subtitle={error}
              onRetry={loadCategories}
              actionLabel="Thử lại"
            />
          ) : undefined
        }
        emptyState={
          <EmptyState
            title="No categories yet"
            subtitle="Get started by creating your very first category branding taxonomy."
            actionLabel="Create Category"
            onAction={() => openDialog()}
          />
        }
      />

      {/* Load More Trigger Button */}
      {hasMore && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loadingMore}
            startIcon={
              loadingMore ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <ChevronDown size={16} />
              )
            }
            sx={{
              borderRadius: 999,
              px: 4,
              py: 1,
              borderColor: "rgba(15, 23, 42, 0.12)",
              color: "text.primary",
              fontWeight: 600,
              textTransform: "none",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "text.primary",
                bgcolor: "rgba(15, 23, 42, 0.03)",
              },
            }}
          >
            {loadingMore ? "Loading Categories..." : "Load More Categories"}
          </Button>
        </Box>
      )}

      {!hasMore && categories.length > 5 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 500 }}
          >
            All categories loaded
          </Typography>
        </Box>
      )}

      {/* Category Creation & Update Dialog Modal Component */}
      <CategoryFormDialog
        open={dialogOpen}
        editing={editing}
        saving={saving}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
        onError={(err) => handleError(err)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(confirmId)}
        title={`Delete "${deleteTargetName}"?`}
        description={`Are you absolutely sure you want to delete the category "${deleteTargetName}"? This action is permanent and cannot be undone.`}
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
