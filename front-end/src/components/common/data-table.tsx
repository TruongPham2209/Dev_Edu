"use client";

import { TableColumnConfig } from "@/components/skeleton/common-skeletons";
import {
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";

export interface ColumnDef<T> {
  header: ReactNode;
  width?: number | string;
  align?: "left" | "center" | "right";
  render: (item: T, index: number) => ReactNode;
  skeletonVariant?: TableColumnConfig["variant"];
  renderSkeleton?: () => ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  skeletonRowCount?: number;
  keyExtractor: (item: T) => string | number;
  minWidth?: number | string;

  // Data Table Modes
  mode?: "infinite" | "pagination";

  // Pagination
  page?: number;
  totalPages?: number;
  totalElements?: number;
  onPageChange?: (nextPage: number) => void;

  // Optional states
  emptyState?: ReactNode;
  errorState?: ReactNode;
}

const renderCellSkeleton = (variant?: TableColumnConfig["variant"]) => {
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

export function DataTable<T>({
  columns,
  data,
  loading = false,
  skeletonRowCount = 5,
  keyExtractor,
  minWidth = 800,
  mode = "pagination",
  page,
  totalPages,
  totalElements,
  onPageChange,
  emptyState,
  errorState,
}: DataTableProps<T>) {
  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, rowIndex) => (
      <TableRow key={`skeleton-${rowIndex}`}>
        {columns.map((col, colIndex) => (
          <TableCell
            key={`col-${colIndex}`}
            sx={{ textAlign: col.align || "left", py: 2 }}
          >
            {col.renderSkeleton
              ? col.renderSkeleton()
              : renderCellSkeleton(col.skeletonVariant)}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  // Check if we should render full table as skeletons
  const isFullSkeleton =
    loading &&
    (mode === "pagination" || (mode === "infinite" && data.length === 0));

  return (
    <>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          borderRadius: 1.5,
          borderColor: "rgba(0,0,0,0.08)",
          boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.02)",
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto !important",
          WebkitOverflowScrolling: "touch",
          "&::-webkit-scrollbar": {
            height: 6,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "divider",
            borderRadius: 1,
          },
        }}
      >
        <Table
          stickyHeader
          sx={{
            minWidth: minWidth || "100%",
            width: "100%",
          }}
        >
          <TableHead>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell
                  key={`th-${index}`}
                  width={col.width}
                  sx={{
                    fontWeight: 700,
                    bgcolor: "#f8fafc",
                    color: "text.secondary",
                    textAlign: col.align || "left",
                    py: { xs: 1.25, sm: 1.75 },
                    px: { xs: 1.5, sm: 2 },
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isFullSkeleton ? (
              renderSkeletons(skeletonRowCount)
            ) : errorState ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  {errorState}
                </TableCell>
              </TableRow>
            ) : data.length === 0 && !loading && emptyState ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 4 }}
                >
                  {emptyState}
                </TableCell>
              </TableRow>
            ) : (
              <>
                {data.map((item, index) => (
                  <TableRow
                    key={keyExtractor(item)}
                    hover
                    sx={{
                      transition: "all 0.1s ease",
                      "& td": { borderBottom: "1px solid rgba(0,0,0,0.04)" },
                    }}
                  >
                    {columns.map((col, colIndex) => (
                      <TableCell
                        key={`td-${colIndex}`}
                        sx={{
                          textAlign: col.align || "left",
                          py: { xs: 1.25, sm: 1.75 },
                          px: { xs: 1.5, sm: 2 },
                          whiteSpace: "nowrap",
                        }}
                      >
                        {col.render(item, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

                {/* Append skeleton rows in infinite mode if loading and we already have some data */}
                {loading &&
                  mode === "infinite" &&
                  data.length > 0 &&
                  renderSkeletons(skeletonRowCount)}
              </>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination Footer */}
      {mode === "pagination" &&
        page !== undefined &&
        totalPages !== undefined &&
        onPageChange && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: { xs: 1.5, sm: 2.5 },
              borderTop: "1px solid rgba(15, 23, 42, 0.08)",
              flexWrap: "wrap",
              gap: 1.5,
              bgcolor: "#f8fafc",
              borderBottomLeftRadius: 8,
              borderBottomRightRadius: 8,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              Showing page {page + 1} of {totalPages || 1}{" "}
              {totalElements !== undefined && `(${totalElements} items)`}
            </Typography>

            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button
                variant="outlined"
                size="small"
                disabled={page === 0 || loading}
                onClick={() => onPageChange(page - 1)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  borderColor: "rgba(15, 23, 42, 0.12)",
                  color: "text.primary",
                  bgcolor: "white",
                  "&:hover": {
                    borderColor: "text.primary",
                    bgcolor: "rgba(15, 23, 42, 0.03)",
                  },
                }}
              >
                Previous
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={page >= (totalPages || 1) - 1 || loading}
                onClick={() => onPageChange(page + 1)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 2,
                  borderColor: "rgba(15, 23, 42, 0.12)",
                  color: "text.primary",
                  bgcolor: "white",
                  "&:hover": {
                    borderColor: "text.primary",
                    bgcolor: "rgba(15, 23, 42, 0.03)",
                  },
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
    </>
  );
}
