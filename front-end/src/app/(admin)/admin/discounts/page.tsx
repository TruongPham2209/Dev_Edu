"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { HeroInfo } from "@/components/common/hero-section/hero-info";
import { DiscountFormDialog } from "@/components/dialog/discount-form";
import {
  useDeleteCourseDiscountMutation,
  useGlobalCourseDiscountsInfiniteQuery,
} from "@/lib/api/enrollments";
import type { CourseDiscountResponse } from "@/lib/type/courses";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Button, CircularProgress, Stack } from "@mui/material";
import { ChevronDown, Percent, Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DiscountsTable } from "./discounts-table";

export default function AdminDiscountsPage() {
  const { handleError, showSuccess } = useApiWithToast();

  // Dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Observer target ref
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // React Query Hooks
  const {
    data,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
    refetch: fetchDiscounts,
    error,
  } = useGlobalCourseDiscountsInfiniteQuery();

  const isError = Boolean(error);

  const discounts = useMemo(() => {
    return data?.pages.flatMap((page) => page.contents) ?? [];
  }, [data]);

  const { mutateAsync: deleteCourseDiscountMutate, isPending: deleting } =
    useDeleteCourseDiscountMutation();

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load discounts");
    }
  }, [error, handleError]);

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

  const handleRefresh = () => {
    fetchDiscounts();
  };

  const handleCreateSaved = (newDiscount: CourseDiscountResponse) => {
    fetchDiscounts();
  };

  const handleDeleteTrigger = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId || deleting) return;
    try {
      await deleteCourseDiscountMutate(deleteConfirmId);
      showSuccess("Successfully deleted discount campaign!");
      setDeleteConfirmId(null);
      fetchDiscounts();
    } catch (err) {
      handleError(err, "Failed to delete discount campaign");
    }
  };

  const selectedDeleteDiscount = discounts.find(
    (d) => d.id === deleteConfirmId,
  );

  const getDeleteDescription = () => {
    if (!selectedDeleteDiscount) return "";
    const prefix = deleting ? "Deleting..." : "Are you sure you want to delete";
    const suffix = deleting ? "..." : "?";

    if (!selectedDeleteDiscount.courseId) {
      return `${prefix} discount campaign ${selectedDeleteDiscount.discountPercentage}% ("${selectedDeleteDiscount.discountDescription}") applied to all courses${suffix}`;
    }
    return `${prefix} discount campaign ${selectedDeleteDiscount.discountPercentage}% ("${selectedDeleteDiscount.discountDescription}") of course "${selectedDeleteDiscount.courseTitle}"${suffix}`;
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
              tooltip="Reload data"
              onClick={handleRefresh}
              variant="soft"
              color="info"
              icon={<RefreshCw size={21} strokeWidth={2.3} />}
            />
            <ButtonAction
              tooltip="Create global discount"
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
                  title="Failed to load discounts"
                  subtitle="Failed to load discounts. Please try again later."
                  onRetry={handleRefresh}
                />
              ) : undefined
            }
            emptyState={
              <EmptyState
                title="No discount campaigns found"
                subtitle="No discount campaigns are currently running. Please set up a global discount campaign applied to all courses to encourage course enrollments."
                icon={<Percent size={32} />}
                actionLabel="Create discount campaign"
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
            {hasNextPage && (
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
                    Load more discounts
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
            ? "Delete course discount?"
            : "Delete global discount?"
        }
        description={getDeleteDescription()}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          if (!deleting) setDeleteConfirmId(null);
        }}
      />
    </Stack>
  );
}
