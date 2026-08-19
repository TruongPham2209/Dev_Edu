"use client";

import ButtonAction from "@/components/common/button-action";
import { ColumnDef, DataTable } from "@/components/common/data-table";
import type { CourseResponse } from "@/lib/type/courses";
import { formatServerDate } from "@/lib/util/date-utils";
import { Avatar, Box, Skeleton, Typography } from "@mui/material";
import { BookOpen, Edit, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const stripHtml = (html: string = "") => {
  return html.replace(/<[^>]*>/g, "").trim();
};

interface CourseTableProps {
  courses: CourseResponse[];
  loading: boolean;
  onPreviewImage: (url: string) => void;
  onEditCourse: (course: CourseResponse) => void;
  onDeleteCourse: (id: string) => void;
  errorState?: React.ReactNode;
  emptyState?: React.ReactNode;
}

export function CourseTable({
  courses,
  loading,
  onPreviewImage,
  onEditCourse,
  onDeleteCourse,
  errorState,
  emptyState,
}: CourseTableProps) {
  const router = useRouter();

  const columns: ColumnDef<CourseResponse>[] = [
    {
      header: "Thumbnail",
      width: 100,
      skeletonVariant: "thumbnail",
      render: (course) => (
        <Avatar
          src={course.thumbnailUrl || undefined}
          variant="rounded"
          onClick={() => {
            if (course.thumbnailUrl) {
              onPreviewImage(course.thumbnailUrl);
            }
          }}
          sx={{
            width: 48,
            height: 48,
            bgcolor: "rgba(37, 99, 235, 0.08)",
            color: "#2563eb",
            border: "1px solid rgba(15, 23, 42, 0.08)",
            cursor: course.thumbnailUrl ? "pointer" : "default",
            transition: "all 0.2s ease",
            "&:hover": course.thumbnailUrl
              ? {
                  transform: "scale(1.08)",
                  borderColor: "primary.main",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }
              : {},
          }}
        >
          <BookOpen size={20} className="text-blue-500" />
        </Avatar>
      ),
    },
    {
      header: "Description",
      skeletonVariant: "text-double",
      width: 500,
      render: (course) => (
        <>
          <Typography
            sx={{
              fontWeight: 700,
              color: "text.primary",
              fontSize: "0.925rem",
              mb: 0.5,
              wordBreak: "break-word",
            }}
          >
            {course.title}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
              wordBreak: "break-word",
            }}
          >
            {stripHtml(course.description)}
          </Typography>
        </>
      ),
    },
    {
      header: "Price",
      width: 180,
      skeletonVariant: "text",
      render: (course) => (
        <Typography
          sx={{ fontWeight: 700, color: "text.primary", fontSize: "0.875rem" }}
        >
          {course.originalPrice != null
            ? `${course.originalPrice.toLocaleString()} VND`
            : "Free"}
        </Typography>
      ),
    },
    {
      header: "Status",
      width: 140,
      skeletonVariant: "rounded",
      render: () => (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: "0.75rem",
            fontWeight: 700,
            bgcolor: "rgba(16, 185, 129, 0.08)",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.12)",
          }}
        >
          Active
        </Box>
      ),
    },
    {
      header: "Created At",
      width: 180,
      skeletonVariant: "text",
      render: (course) => (
        <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
          {formatServerDate(course.createdAt)}
        </Typography>
      ),
    },
    {
      header: "Actions",
      width: 140,
      align: "center",
      renderSkeleton: () => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      ),
      render: (course) => (
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <ButtonAction
            tooltip="Manage Content"
            icon={<Eye size={16} />}
            variant="soft"
            color="primary"
            onClick={() => router.push(`/admin/courses/${course.id}`)}
          />
          <ButtonAction
            tooltip="Update Info"
            icon={<Edit size={16} />}
            variant="soft"
            color="warning"
            onClick={() => onEditCourse(course)}
          />
          <ButtonAction
            tooltip="Delete Course"
            icon={<Trash2 size={16} />}
            variant="soft"
            color="error"
            onClick={() => onDeleteCourse(course.id)}
          />
        </Box>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={courses}
      loading={loading}
      mode="infinite"
      skeletonRowCount={4}
      keyExtractor={(course) => course.id}
      errorState={errorState}
      emptyState={emptyState}
    />
  );
}
