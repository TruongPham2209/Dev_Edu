"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/skeleton";
import {
  useCourseDiscountsByCourseQuery,
  useDeleteCourseDiscountMutation,
} from "@/lib/api/enrollments";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate, parseServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { BadgePercent, Percent, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DiscountFormDialog } from "../../../../../components/dialog/discount-form";

interface DiscountsListProps {
  courseId: string;
  onTotalCountChange?: (count: number) => void;
}

export function DiscountsList({
  courseId,
  onTotalCountChange,
}: DiscountsListProps) {
  const { handleError, showSuccess } = useApiWithToast();

  // Dialog / Modal States
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // React Query Hooks
  const {
    data: discounts = [],
    isLoading: loading,
    refetch: fetchInitialDiscounts,
    error,
  } = useCourseDiscountsByCourseQuery(courseId);

  useEffect(() => {
    if (onTotalCountChange) {
      onTotalCountChange(discounts.length);
    }
  }, [discounts, onTotalCountChange]);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load discounts");
    }
  }, [error, handleError]);

  const { mutateAsync: deleteCourseDiscountMutate, isPending: deleting } =
    useDeleteCourseDiscountMutation();

  const handleDelete = async () => {
    if (!confirmDeleteId || deleting) return;
    try {
      await deleteCourseDiscountMutate(confirmDeleteId);
      showSuccess("Deleted successfully!");
      setConfirmDeleteId(null);
      fetchInitialDiscounts();
    } catch (err) {
      handleError(err, "Failed to delete discount");
    }
  };

  const getStatusBadge = (fromVal: unknown, toVal: unknown) => {
    const now = new Date();
    const from = parseServerDate(fromVal);
    const to = parseServerDate(toVal);

    if (now < from) {
      return (
        <Chip
          label="Not started yet"
          size="small"
          sx={{
            bgcolor: "rgba(59, 130, 246, 0.08)",
            color: "#3b82f6",
            border: "1px solid rgba(59, 130, 246, 0.12)",
            fontWeight: 700,
            borderRadius: 1.5,
          }}
        />
      );
    } else if (now >= from && now <= to) {
      return (
        <Chip
          label="Active"
          size="small"
          sx={{
            bgcolor: "rgba(16, 185, 129, 0.08)",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.12)",
            fontWeight: 700,
            borderRadius: 1.5,
          }}
        />
      );
    } else {
      return (
        <Chip
          label="Expired"
          size="small"
          sx={{
            bgcolor: "rgba(239, 68, 68, 0.08)",
            color: "#ef4444",
            border: "1px solid rgba(239, 68, 68, 0.12)",
            fontWeight: 700,
            borderRadius: 1.5,
          }}
        />
      );
    }
  };

  const selectedDeleteDiscount = discounts?.find(
    (d) => d.id === confirmDeleteId,
  );

  return (
    <Card
      sx={{
        borderRadius: 1,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        height: { xs: 450, sm: 520 }, // Consistent height for the Data Row
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(245, 158, 11, 0.08)",
              color: "rgb(245, 158, 11)",
              width: 36,
              height: 36,
              border: "1px solid rgba(245, 158, 11, 0.12)",
            }}
          >
            <Percent size={18} />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                lineHeight: 1.2,
                fontSize: { xs: "1rem", sm: "1.25rem" },
              }}
            >
              Discount Campaigns
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage discount campaigns
            </Typography>
          </Box>
        </Box>

        <ButtonAction
          icon={<BadgePercent size={18} />}
          tooltip="Create new discount"
          onClick={() => setModalOpen(true)}
          color="warning"
        />
      </Box>

      {/* Content Area */}
      <CardContent
        sx={{
          p: 0,
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 0 },
        }}
      >
        {loading ? (
          <ListSkeleton count={3} />
        ) : discounts.length === 0 ? (
          <Box sx={{ m: "auto", p: 4, width: "100%" }}>
            <EmptyState
              title="No Discount Campaigns"
              subtitle="This course does not have any discount campaigns applied."
              actionLabel="New campaign"
              onAction={() => setModalOpen(true)}
            />
          </Box>
        ) : (
          <Stack spacing={0} sx={{ width: "100%" }}>
            {discounts.map((discount, index) => (
              <Box key={discount.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 2 },
                    transition: "background-color 0.15s ease",
                    "&:hover": {
                      bgcolor: "rgba(15, 23, 42, 0.02)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={{ xs: 1.5, sm: 2 }}
                    sx={{ overflow: "hidden", mr: 1.5 }}
                  >
                    <Avatar
                      variant="rounded"
                      sx={{
                        bgcolor: "rgba(13, 168, 34, 0.15)",
                        color: "#0da822",
                        width: { xs: 38, sm: 44 },
                        height: { xs: 38, sm: 44 },
                        flexShrink: 0,
                        border: "1px solid rgba(13, 168, 34, 0.15)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 850,
                          fontSize: { xs: "0.825rem", sm: "0.95rem" },
                        }}
                      >
                        -{discount.discountPercentage}%
                      </Typography>
                    </Avatar>
                    <Box sx={{ overflow: "hidden" }}>
                      <Stack
                        component="div"
                        direction="row"
                        spacing={1.5}
                        sx={{
                          alignItems: "center",
                          mb: 0.5,
                          flexWrap: "wrap",
                          gap: 1,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "text.primary",
                            fontSize: { xs: "0.875rem", sm: "0.95rem" },
                            wordBreak: "break-word",
                          }}
                        >
                          {discount.discountDescription}
                        </Typography>
                        {getStatusBadge(discount.validFrom, discount.validTo)}
                      </Stack>

                      <Box sx={{ color: "text.secondary", mt: 0.75 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 550, wordBreak: "break-word" }}
                        >
                          {formatServerDate(discount.validFrom, "datetime")} -{" "}
                          {formatServerDate(discount.validTo, "datetime")}
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  <Tooltip title="Delete campaign" arrow>
                    <IconButton
                      onClick={() => setConfirmDeleteId(discount.id)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        color: "error.main",
                        bgcolor: "rgba(211,47,47,0.06)",
                        "&:hover": {
                          bgcolor: "rgba(211,47,47,0.12)",
                        },
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </Tooltip>
                </Box>
                {index < discounts.length - 1 && (
                  <Divider
                    sx={{ mx: 3, borderColor: "rgba(15, 23, 42, 0.04)" }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>

      {/* Save Modal */}
      <DiscountFormDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          fetchInitialDiscounts();
        }}
        courseId={courseId}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete campaign?"
        description={
          deleting
            ? `Deleting discount campaign "${selectedDeleteDiscount?.discountDescription || ""}" (${selectedDeleteDiscount?.discountPercentage}%)...`
            : `Are you sure you want to delete the discount campaign "${selectedDeleteDiscount?.discountDescription || ""}" (${selectedDeleteDiscount?.discountPercentage}%)? The course price will be restored to the default price.`
        }
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </Card>
  );
}
