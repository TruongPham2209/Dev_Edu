"use client";

import { Avatar, Box, Skeleton, Typography } from "@mui/material";
import { Edit, Folder, Trash2 } from "lucide-react";
import { DataTable, ColumnDef } from "@/components/common/data-table";
import type { CategoryResponse } from "@/lib/api/types";
import ButtonAction from "@/components/common/button-action";

interface CategoryTableProps {
  categories: CategoryResponse[];
  loading?: boolean;
  onEdit: (category: CategoryResponse) => void;
  onDelete: (id: string, name: string) => void;
  onPreviewImage: (url: string) => void;
  errorState?: React.ReactNode;
  emptyState?: React.ReactNode;
}

export function CategoryTable({
  categories,
  loading = false,
  onEdit,
  onDelete,
  onPreviewImage,
  errorState,
  emptyState,
}: CategoryTableProps) {
  const columns: ColumnDef<CategoryResponse>[] = [
    {
      header: "STT",
      width: 60,
      skeletonVariant: "text",
      render: (_, index) => (
        <Typography sx={{ fontWeight: 500 }}>{index + 1}</Typography>
      ),
    },
    {
      header: "Image",
      width: 80,
      skeletonVariant: "thumbnail",
      render: (category) => (
        <Avatar
          src={category.thumbnailUrl}
          alt={category.name}
          variant="rounded"
          onClick={() => {
            if (category.thumbnailUrl) {
              onPreviewImage(category.thumbnailUrl);
            }
          }}
          sx={{
            width: 48,
            height: 48,
            border: "1px solid rgba(15, 23, 42, 0.08)",
            bgcolor: "grey.50",
            color: "primary.main",
            cursor: category.thumbnailUrl ? "pointer" : "default",
            transition: "all 0.2s ease",
            "&:hover": category.thumbnailUrl
              ? {
                  transform: "scale(1.08)",
                  borderColor: "primary.main",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }
              : {},
          }}
        >
          <Folder size={20} className="text-slate-400" />
        </Avatar>
      ),
    },
    {
      header: "Name",
      width: 280,
      skeletonVariant: "text",
      render: (category) => (
        <Typography sx={{ fontWeight: 600, color: "text.primary" }}>
          {category.name}
        </Typography>
      ),
    },
    {
      header: "Description",
      skeletonVariant: "text-double",
      render: (category) => (
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            maxWidth: 450,
          }}
        >
          {category.description}
        </Typography>
      ),
    },
    {
      header: "Total Courses",
      width: 150,
      skeletonVariant: "text",
      render: (category) => (
        <Typography
          sx={{
            fontWeight: 600,
            color:
              (category.totalCourses ?? 0) > 0
                ? "primary.main"
                : "text.secondary",
          }}
        >
          {category.totalCourses ?? 0}
        </Typography>
      ),
    },
    {
      header: "Actions",
      width: 120,
      align: "right",
      renderSkeleton: () => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      ),
      render: (category) => {
        const canDelete = (category.totalCourses ?? 0) === 0;
        return (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <ButtonAction
              tooltip="Update"
              icon={<Edit size={16} />}
              variant="soft"
              color="primary"
              onClick={() => onEdit(category)}
            />
            <ButtonAction
              tooltip={
                canDelete
                  ? "Delete"
                  : "This category cannot be deleted because it still contains active courses."
              }
              icon={<Trash2 size={16} />}
              variant="soft"
              color="error"
              disabled={!canDelete}
              onClick={() => onDelete(category.id, category.name)}
            />
          </Box>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={categories}
      loading={loading}
      mode="infinite"
      skeletonRowCount={5}
      keyExtractor={(c) => c.id}
      minWidth={750}
      errorState={errorState}
      emptyState={emptyState}
    />
  );
}
