"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { HeroInfo } from "@/components/common/hero-section/hero-info";
import { ImagePreview } from "@/components/common/image-preview";
import { CategoryFormDialog } from "@/components/dialog/category-form";
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from "@/lib/api/courses";
import { usePreSignedUploadUrlMutation } from "@/lib/api/files";
import type { CategoryRequest, CategoryResponse } from "@/lib/type/courses";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Stack, Typography } from "@mui/material";
import { FolderPlus, Layers, RefreshCw } from "lucide-react";
import { useState } from "react";
import { CategoryTable } from "./category-table";

export default function AdminCategoriesPage() {
  const { handleError, showSuccess } = useApiWithToast();

  // Queries & Mutations
  const {
    data: categories = [],
    isLoading: loading,
    error: queryError,
    refetch: loadCategories,
  } = useCategoriesQuery("ACTIVE");

  const { mutateAsync: createCategoryMutate } = useCreateCategoryMutation();
  const { mutateAsync: updateCategoryMutate } = useUpdateCategoryMutation();
  const { mutateAsync: deleteCategoryMutate, isPending: deleting } =
    useDeleteCategoryMutation();
  const { mutateAsync: getPreSignedUrlMutate, isPending: saving } =
    usePreSignedUploadUrlMutation();

  const error = queryError
    ? "Failed to load categories. Please try again later."
    : null;

  // Dialog Form State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryResponse | null>(null);

  // Delete State
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");

  // Preview Image State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

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
    try {
      let finalThumbnailObjectKey = form.thumbnailObjectKey;

      // Handle S3/R2 direct upload workflow if new branding asset is selected
      if (selectedFile) {
        const preSignRes = await getPreSignedUrlMutate({
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
        await updateCategoryMutate(payload);
        showSuccess("Category updated successfully");
      } else {
        await createCategoryMutate(payload);
        showSuccess("Category created successfully");
      }

      setDialogOpen(false);
      loadCategories();
    } catch (err) {
      handleError(err, "Failed to save category");
    }
  };

  const handleDelete = async () => {
    if (!confirmId || deleting) return;
    try {
      await deleteCategoryMutate(confirmId);
      showSuccess("Category deleted successfully");
      setConfirmId(null);
      loadCategories();
    } catch (err) {
      handleError(err, "Failed to delete category");
    }
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
            tooltip="Refresh Data"
            onClick={() => loadCategories()}
            variant="soft"
            color="info"
            icon={<RefreshCw size={21} strokeWidth={2.3} />}
          />
          <ButtonAction
            tooltip="New Category"
            aria-label="New Category"
            onClick={() => openDialog()}
            icon={<FolderPlus size={21} strokeWidth={2.3} />}
          />
        </Box>
      </Box>

      <CategoryTable
        categories={categories}
        loading={loading}
        onEdit={(cat) => openDialog(cat)}
        onDelete={(id, name) => {
          setConfirmId(id);
          setDeleteTargetName(name);
        }}
        onPreviewImage={setPreviewImage}
        errorState={
          error ? (
            <ErrorState
              title="Failed to load categories"
              subtitle={error}
              onRetry={loadCategories}
              actionLabel="Retry"
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
