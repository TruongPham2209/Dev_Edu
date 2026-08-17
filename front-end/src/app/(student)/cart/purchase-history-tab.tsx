"use client";

import { EmptyState } from "@/components/common/empty-state";
import {
  FilterSelect,
  type FilterItem,
} from "@/components/common/form/filter-select";
import { useOrderHistoryInfinateQuery } from "@/lib/api/enrollments";
import type { PaymentStatus } from "@/lib/type/enum";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Card,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { PackageOpen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CourseOrderItem } from "./course-order-item";

const FILTER_ITEMS: FilterItem[] = [
  { id: "COMPLETED", title: "Completed" },
  { id: "FAILED", title: "Failed" },
  { id: "CANCELLED", title: "Cancelled" },
];

export function PurchaseHistoryTabContent() {
  const [status, setStatus] = useState<PaymentStatus>("COMPLETED");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useOrderHistoryInfinateQuery(status);

  const orders = data?.pages.flatMap((page) => page.contents) || [];

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <Stack spacing={3} sx={{ flex: 1, minWidth: 0, pb: 10 }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={180}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Stack>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <FilterSelect
            value={status}
            onChange={(val) => setStatus(val as PaymentStatus)}
            items={FILTER_ITEMS}
          />
        </Box>
        <Box
          sx={{
            py: 10,
            textAlign: "center",
            bgcolor: "#f8fafc",
            borderRadius: 4,
            border: "1px dashed #cbd5e1",
          }}
        >
          <EmptyState
            title="No orders yet"
            subtitle="You haven't made any transactions yet."
            icon={<PackageOpen size={32} />}
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: { xs: 4, lg: 6 },
        pb: 10,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          mb: { xs: 2.5, sm: 4 },
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            color: "#0f172a",
            fontSize: { xs: "1.1rem", sm: "1.25rem" },
          }}
        >
          Your Orders
        </Typography>
        <FilterSelect
          value={status}
          onChange={(val) => setStatus(val as PaymentStatus)}
          items={FILTER_ITEMS}
        />
      </Box>

      {/* Left Column: Items */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack spacing={{ xs: 2.5, sm: 4 }}>
          {orders.map((order) => (
            <Card
              key={order.id}
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                boxShadow: "0 4px 20px -5px rgba(0,0,0,0.08)",
                border: "1px solid #e2e8f0",
                overflow: "hidden",
              }}
            >
              {/* Order Header */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2.5 },
                  bgcolor: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: { xs: "row", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#64748b",
                      mb: 0.25,
                      fontWeight: 600,
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    }}
                  >
                    Order ID:{" "}
                    <span style={{ color: "#0f172a", fontWeight: 800 }}>
                      #{order.id.split("-")[0].toUpperCase()}
                    </span>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      fontSize: { xs: "0.75rem", sm: "0.85rem" },
                    }}
                  >
                    Placed on:{" "}
                    <span style={{ color: "#0f172a", fontWeight: 600 }}>
                      {formatServerDate(order.createdAt)}
                    </span>
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#64748b",
                      mb: 0.25,
                      fontWeight: 600,
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    }}
                  >
                    Total Amount
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#0ea5e9",
                      fontWeight: 800,
                      lineHeight: 1,
                      fontSize: { xs: "1.05rem", sm: "1.25rem" },
                    }}
                  >
                    {order.totalAmount.toLocaleString()}đ
                  </Typography>
                </Box>
              </Box>

              {/* Order Items */}
              <Box
                sx={{
                  p: { xs: 1.25, sm: 2.5 },
                  display: "flex",
                  flexDirection: "column",
                  gap: { xs: 1.5, sm: 2.5 },
                  bgcolor: "#ffffff",
                }}
              >
                {order.items.map((item) => (
                  <CourseOrderItem
                    key={item.courseId}
                    item={item}
                    tabContext="order"
                    orderStatus={order.status}
                  />
                ))}
              </Box>
            </Card>
          ))}
        </Stack>

        {hasNextPage && (
          <Box
            ref={observerTarget}
            sx={{ py: 4, display: "flex", justifyContent: "center" }}
          >
            {isFetchingNextPage ? (
              <CircularProgress size={30} sx={{ color: "#0284c7" }} />
            ) : (
              <Typography variant="body2" sx={{ color: "transparent" }}>
                .
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}
