import React from "react";
import {
  Box,
  Divider,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

// ==========================================
// 1. LIST ITEM & LIST SKELETON
// ==========================================

export interface ListItemSkeletonProps {
  avatarVariant?: "circular" | "rounded" | "none";
  avatarSize?: number;
  lines?: number;
  hasAction?: boolean;
  alignItems?: "center" | "flex-start";
  padding?: number | string;
}

export function ListItemSkeleton({
  avatarVariant = "circular",
  avatarSize = 40,
  lines = 2,
  hasAction = false,
  alignItems = "center",
  padding = 0,
}: ListItemSkeletonProps) {
  return (
    <Box
      sx={{
        py: 1.5,
        px: padding,
        display: "flex",
        alignItems,
        gap: 2,
        width: "100%",
      }}
    >
      {avatarVariant !== "none" && (
        <Skeleton
          variant={avatarVariant}
          width={avatarSize}
          height={avatarSize}
          sx={{ flexShrink: 0 }}
        />
      )}
      <Box sx={{ flexGrow: 1 }}>
        {Array.from({ length: lines }).map((_, idx) => (
          <Skeleton
            key={idx}
            width={idx === 0 ? "50%" : idx === 1 ? "30%" : "20%"}
            height={idx === 0 ? 18 : 14}
            sx={{ mt: idx > 0 ? 0.75 : 0 }}
          />
        ))}
      </Box>
      {hasAction && (
        <Skeleton
          variant="circular"
          width={32}
          height={32}
          sx={{ flexShrink: 0 }}
        />
      )}
    </Box>
  );
}

export interface ListSkeletonProps extends ListItemSkeletonProps {
  count?: number;
  divider?: boolean;
}

export function ListSkeleton({
  count = 4,
  divider = false,
  padding = 3,
  ...itemProps
}: ListSkeletonProps) {
  return (
    <Stack spacing={0} sx={{ p: padding, width: "100%" }}>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          <ListItemSkeleton {...itemProps} />
          {divider && index < count - 1 && (
            <Divider sx={{ mx: 0, borderColor: "divider" }} />
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
}

// ==========================================
// 2. TABLE SKELETON
// ==========================================

export interface TableColumnConfig {
  label?: string;
  width?: number | string;
  align?: "left" | "center" | "right";
  variant?: "text" | "text-double" | "circular" | "rounded" | "thumbnail" | "action" | "actions";
}

export interface TableSkeletonProps {
  columns?: TableColumnConfig[];
  rowCount?: number;
  hasHeader?: boolean;
}

export function TableSkeleton({
  columns = [
    { label: "Item", width: "40%", variant: "thumbnail" },
    { label: "Category", width: "20%", variant: "text" },
    { label: "Status", width: "20%", variant: "rounded" },
    { label: "Actions", width: "20%", align: "right", variant: "actions" },
  ],
  rowCount = 5,
  hasHeader = true,
}: TableSkeletonProps) {
  const renderCellSkeleton = (variant: TableColumnConfig["variant"]) => {
    switch (variant) {
      case "thumbnail":
        return (
          <Skeleton
            variant="rounded"
            width={48}
            height={48}
            sx={{ borderRadius: 1.5 }}
          />
        );
      case "circular":
        return <Skeleton variant="circular" width={40} height={40} />;
      case "rounded":
        return (
          <Skeleton
            variant="rounded"
            width={60}
            height={20}
            sx={{ borderRadius: 1 }}
          />
        );
      case "action":
        return (
          <Skeleton
            variant="rounded"
            width={80}
            height={32}
            sx={{ borderRadius: 1.5 }}
          />
        );
      case "actions":
        return (
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        );
      case "text-double":
        return (
          <Stack spacing={0.5}>
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="90%" height={16} />
          </Stack>
        );
      case "text":
      default:
        return <Skeleton variant="text" width="80%" height={20} />;
    }
  };

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflowX: "auto",
          width: "100%",
        }}
      >
        <Table>
          {hasHeader && (
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                {columns.map((col, index) => (
                  <TableCell
                    key={index}
                    width={col.width}
                    sx={{
                      fontWeight: 700,
                      textAlign: col.align || "left",
                    }}
                  >
                    {col.label || <Skeleton variant="text" width="50%" />}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}
          <TableBody>
            {Array.from({ length: rowCount }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={colIndex}
                    sx={{ textAlign: col.align || "left" }}
                  >
                    {renderCellSkeleton(col.variant)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
