"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { HeroInfo } from "@/components/common/hero-info";
import { DiscountFormDialog } from "@/components/dialog/discount-form";
import {
  deleteCourseDiscount,
  getGlobalCourseDiscounts,
} from "@/lib/api/enrollments";
import type { CourseDiscountResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Button, CircularProgress, Stack } from "@mui/material";
import { ChevronDown, Percent, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DiscountsTable } from "./discounts-table";

export default function AdminDiscountsPage() {
  const { handleError, showSuccess } = useApiWithToast();

  const [discounts, setDiscounts] = useState<CourseDiscountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null | undefined>(null);
  const [isError, setIsError] = useState(false);

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Ref to track duplicate API requests
  const isFetchingRef = useRef(false);
  // Observer target ref
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const fetchDiscounts = useCallback(
    async (cursor?: string, isAppend?: boolean) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await getGlobalCourseDiscounts(cursor);
        if (isAppend) {
          setDiscounts((prev) => [...prev, ...response.contents]);
        } else {
          setDiscounts(response.contents);
        }
        setNextCursor(response.nextCursor);
        setIsError(false);
      } catch (err) {
        handleError(err, "Không thể tải danh sách giảm giá");
        setIsError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [handleError],
  );

  // Initial load
  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  // Load More Handler
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !nextCursor) return;
    fetchDiscounts(nextCursor, true);
  }, [loading, loadingMore, nextCursor, fetchDiscounts]);

  // Auto Infinite scroll using IntersectionObserver
  useEffect(() => {
    const currentTarget = observerTargetRef.current;
    if (!currentTarget || !nextCursor || loading || loadingMore) return;

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
  }, [nextCursor, loading, loadingMore, handleLoadMore]);

  const handleRefresh = () => {
    fetchDiscounts();
  };

  const handleCreateSaved = (newDiscount: CourseDiscountResponse) => {
    // Prepend newly created global discount into state, avoiding page reload
    setDiscounts((prev) => [newDiscount, ...prev]);
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId || deleting) return;
    try {
      setDeleting(true);
      await deleteCourseDiscount(deleteConfirmId);
      showSuccess("Đã xóa chiến dịch giảm giá thành công!");
      setDiscounts((prev) => prev.filter((d) => d.id !== deleteConfirmId));
      setDeleteConfirmId(null);
    } catch (err) {
      handleError(err, "Không thể xóa chiến dịch giảm giá");
    } finally {
      setDeleting(false);
    }
  };

  const selectedDeleteDiscount = discounts.find(
    (d) => d.id === deleteConfirmId,
  );

  const getDeleteDescription = () => {
    if (!selectedDeleteDiscount) return "";
    const prefix = deleting
      ? "Đang tiến hành xóa"
      : "Bạn có chắc chắn muốn xóa";
    const suffix = deleting ? "..." : "?";

    if (!selectedDeleteDiscount.courseId) {
      return `${prefix} chiến dịch giảm giá ${selectedDeleteDiscount.discountPercentage}% ("${selectedDeleteDiscount.discountDescription}") áp dụng cho tất cả khóa học${suffix}`;
    }
    return `${prefix} chiến dịch giảm giá ${selectedDeleteDiscount.discountPercentage}% ("${selectedDeleteDiscount.discountDescription}") của khóa học "${selectedDeleteDiscount.courseTitle}"${suffix}`;
  };

  return (
    <Stack spacing={4} sx={{ width: "100%", pb: 5 }}>
      <HeroInfo
        title="Discounts Management"
        description="Centralized command center for discount strategies. Create global promotional campaigns, manage course-specific sales, and monitor the active status of discount codes to boost marketplace conversions."
        icon={<Percent size={24} className="text-blue-400" />}
        tags={["Create Discounts", "Global Discounts", "Delete Discounts"]}
      />

      {/* Main Table Content */}
      <Box>
        <Stack spacing={3}>
          {/* Table Header with Actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              mb: -1,
              gap: 1,
            }}
          >
            <ButtonAction
              tooltip="Tải lại dữ liệu"
              onClick={handleRefresh}
              variant="soft"
              color="info"
              icon={<RefreshCw size={21} strokeWidth={2.3} />}
            />
            <ButtonAction
              tooltip="Tạo giảm giá chung"
              onClick={() => setFormDialogOpen(true)}
              icon={<Plus size={21} strokeWidth={2.3} />}
            />
          </Box>

          {/* Table */}
          <DiscountsTable
            discounts={discounts}
            loading={loading || loadingMore}
            onDeleteClick={handleDeleteTrigger}
            errorState={
              isError ? (
                <ErrorState
                  title="Lỗi tải dữ liệu"
                  subtitle="Không thể tải danh sách giảm giá. Vui lòng thử lại sau."
                  onRetry={handleRefresh}
                />
              ) : undefined
            }
            emptyState={
              <EmptyState
                title="Chưa có chiến dịch giảm giá nào"
                subtitle="Chưa có chương trình ưu đãi học phí nào đang chạy. Hãy thiết lập một chiến dịch giảm giá chung áp dụng cho tất cả khóa học để thúc đẩy đăng ký học."
                icon={<Percent size={32} />}
                actionLabel="Tạo chiến dịch ưu đãi"
                onAction={() => setFormDialogOpen(true)}
              />
            }
          />

          {/* Pagination Load More & Bottom Loading Indicators */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              mt: 1,
            }}
          >
            {nextCursor && (
              <Box
                ref={observerTargetRef}
                sx={{
                  py: 3,
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                {loadingMore ? (
                  <CircularProgress size={32} thickness={4} />
                ) : (
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    startIcon={<ChevronDown size={18} />}
                    sx={{
                      borderRadius: 2.5,
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Tải thêm giảm giá
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      {/* Discount Form Dialog */}
      <DiscountFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        onSaved={handleCreateSaved}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteConfirmId)}
        title={
          selectedDeleteDiscount?.courseId
            ? "Xóa giảm giá khóa học?"
            : "Xóa giảm giá chung?"
        }
        description={getDeleteDescription()}
        confirmLabel={deleting ? "Đang xóa..." : "Xóa"}
        cancelLabel="Hủy bỏ"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleting) setDeleteConfirmId(null);
        }}
      />
    </Stack>
  );
}
