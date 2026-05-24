"use client";

import type { CourseDiscountResponse } from "@/lib/api/types";
import { formatServerDate, parseServerDate } from "@/lib/date-utils";
import { Avatar, Box, Skeleton, Typography } from "@mui/material";
import { Calendar, Trash2, User } from "lucide-react";
import ButtonAction from "@/components/common/button-action";
import { DataTable, ColumnDef } from "@/components/common/data-table";

interface DiscountsTableProps {
  discounts: CourseDiscountResponse[];
  loading?: boolean;
  onDeleteClick: (id: string) => void;
  errorState?: React.ReactNode;
  emptyState?: React.ReactNode;
}

export function DiscountsTable({
  discounts,
  loading = false,
  onDeleteClick,
  errorState,
  emptyState,
}: DiscountsTableProps) {
  const getStatusBadge = (fromVal: unknown, toVal: unknown) => {
    const now = new Date();
    const from = parseServerDate(fromVal);
    const to = parseServerDate(toVal);

    if (now < from) {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#3b82f6",
            bgcolor: "rgba(59, 130, 246, 0.08)",
            border: "1px solid rgba(59, 130, 246, 0.16)",
          }}
        >
          Sắp diễn ra
        </Box>
      );
    } else if (now >= from && now <= to) {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#10b981",
            bgcolor: "rgba(16, 185, 129, 0.08)",
            border: "1px solid rgba(16, 185, 129, 0.16)",
          }}
        >
          Đang áp dụng
        </Box>
      );
    } else {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "#ef4444",
            bgcolor: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.16)",
          }}
        >
          Hết hạn
        </Box>
      );
    }
  };

  const renderDiscountScope = (discount: CourseDiscountResponse) => {
    if (!discount.courseId) {
      return (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1,
            py: 0.25,
            borderRadius: 1.5,
            fontSize: "0.675rem",
            fontWeight: 700,
            color: "#6b7280",
            bgcolor: "rgba(107, 114, 128, 0.06)",
            border: "1px solid rgba(107, 114, 128, 0.12)",
            mt: 0.5,
          }}
        >
          Áp dụng cho tất cả khóa học
        </Box>
      );
    }

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1,
            py: 0.25,
            borderRadius: 1.5,
            fontSize: "0.675rem",
            fontWeight: 700,
            color: "#6366f1",
            bgcolor: "rgba(99, 102, 241, 0.06)",
            border: "1px solid rgba(99, 102, 241, 0.12)",
          }}
        >
          Khóa học
        </Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            fontWeight: 650,
            maxWidth: 240,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={discount.courseTitle || ""}
        >
          {discount.courseTitle}
        </Typography>
      </Box>
    );
  };

  const columns: ColumnDef<CourseDiscountResponse>[] = [
    {
      header: "Mức giảm (%)",
      width: 140,
      renderSkeleton: () => (
        <Skeleton
          variant="rounded"
          width={52}
          height={52}
          sx={{ borderRadius: 2.5 }}
        />
      ),
      render: (discount) => (
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 52,
            height: 52,
            borderRadius: 2.5,
            bgcolor: "rgba(16, 185, 129, 0.12)",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.2)",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 850 }}>
            -{discount.discountPercentage}%
          </Typography>
        </Box>
      ),
    },
    {
      header: "Mô tả chiến dịch",
      skeletonVariant: "text-double",
      render: (discount) => (
        <>
          <Typography
            variant="body2"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            {discount.discountDescription}
          </Typography>
          {renderDiscountScope(discount)}
        </>
      ),
    },
    {
      header: "Thời hạn áp dụng",
      width: 320,
      skeletonVariant: "text",
      render: (discount) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "text.secondary",
          }}
        >
          <Calendar
            size={15}
            style={{ color: "var(--mui-palette-text-secondary)" }}
          />
          <Typography
            variant="body2"
            sx={{ fontWeight: 550, fontSize: "0.825rem" }}
          >
            {formatServerDate(discount.validFrom, "datetime")} -{" "}
            {formatServerDate(discount.validTo, "datetime")}
          </Typography>
        </Box>
      ),
    },
    {
      header: "Trạng thái",
      width: 140,
      skeletonVariant: "rounded",
      render: (discount) =>
        getStatusBadge(discount.validFrom, discount.validTo),
    },
    {
      header: "Người tạo",
      width: 220,
      renderSkeleton: () => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Skeleton variant="circular" width={24} height={24} />
          <Box>
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={120} height={16} />
          </Box>
        </Box>
      ),
      render: (discount) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              width: 24,
              height: 24,
              bgcolor: "grey.100",
              color: "text.secondary",
            }}
          >
            <User size={12} />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {discount.createdBy}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tạo lúc {formatServerDate(discount.createdAt, "date")}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      header: "Thao tác",
      width: 100,
      align: "right",
      renderSkeleton: () => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <Skeleton variant="circular" width={32} height={32} />
        </Box>
      ),
      render: (discount) => (
        <ButtonAction
          tooltip="Xóa giảm giá"
          icon={<Trash2 size={16} />}
          variant="soft"
          color="error"
          onClick={() => onDeleteClick(discount.id)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={discounts}
      loading={loading}
      mode="infinite"
      skeletonRowCount={4}
      keyExtractor={(d) => d.id}
      errorState={errorState}
      emptyState={emptyState}
    />
  );
}
