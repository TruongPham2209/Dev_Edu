import type { CourseItemDetailResponse } from "@/lib/type/enrollments";
import type { PaymentStatus } from "@/lib/type/enum";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircle2, PlayCircle, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ReviewDialog } from "../../../components/dialog/review-dialog";

const stripHtml = (html: string = "") => {
  return html.replace(/<[^>]*>/g, "").trim();
};

interface CourseOrderItemProps {
  item: CourseItemDetailResponse | any;
  tabContext: "cart" | "order" | "enrolled";
  onRemove?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  orderStatus?: PaymentStatus;
}

export function CourseOrderItem({
  item,
  tabContext,
  onRemove,
  selected,
  onSelect,
  orderStatus,
}: CourseOrderItemProps) {
  const title = item.title || "No title";
  const thumbnailUrl =
    item.thumbnailUrl ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop";
  const courseId = item.courseId || item.id;
  const originalPrice = item.originalPrice;
  const discountedPrice = item.discountedPrice ?? item.price;

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  return (
    <Card
      sx={{
        borderRadius: 1,
        boxShadow: "0 4px 15px -5px rgba(0,0,0,0.05)",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        "&:hover": {
          boxShadow: "0 12px 30px -10px rgba(0,0,0,0.12)",
          transform: "translateY(-4px)",
          borderColor: "rgba(14, 165, 233, 0.2)",
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 2.5 },
          "&:last-child": { pb: { xs: 2, sm: 2.5 } },
        }}
      >
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          {/* ROW 1: Image + Title + Trash/Chip */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
              width: "100%",
            }}
          >
            {tabContext === "cart" && onSelect && (
              <Checkbox
                checked={!!selected}
                onChange={(e) => onSelect(courseId, e.target.checked)}
                sx={{
                  p: 0.5,
                  color: "#cbd5e1",
                  "&.Mui-checked": { color: "#0284c7" },
                }}
              />
            )}

            <Box
              component={Link}
              href={`/courses/${courseId}`}
              sx={{
                width: { xs: 80, sm: 110, md: 130 },
                height: { xs: 54, sm: 72, md: 82 },
                borderRadius: 0.5,
                overflow: "hidden",
                flexShrink: 0,
                position: "relative",
                display: "block",
                border: "1px solid #e2e8f0",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                component={Link}
                href={`/courses/${courseId}`}
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  textDecoration: "none",
                  fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.1rem" },
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  "&:hover": { color: "#0284c7" },
                }}
              >
                {title}
              </Typography>
            </Box>

            {tabContext === "cart" && onRemove && (
              <IconButton
                onClick={() => onRemove(item.id)}
                size="small"
                sx={{
                  color: "#94a3b8",
                  flexShrink: 0,
                  "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" },
                }}
              >
                <Trash2 size={18} />
              </IconButton>
            )}

            {tabContext === "order" && (
              <Chip
                icon={<CheckCircle2 size={14} />}
                label={orderStatus}
                size="small"
                sx={{
                  bgcolor: "#dcfce7",
                  color: "#166534",
                  fontWeight: 700,
                  flexShrink: 0,
                  "& .MuiChip-icon": { color: "#166534" },
                }}
              />
            )}
          </Box>

          {/* ROW 2: Description */}
          {item.description && (
            <Typography
              variant="body2"
              sx={{
                color: "#64748b",
                fontSize: { xs: "0.825rem", sm: "0.875rem" },
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {stripHtml(item.description)}
            </Typography>
          )}

          {/* ROW 3: Price, Purchased Date, Actions (Review / Learn) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pt: 1.25,
              borderTop: "1px solid #f1f5f9",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            {/* Left Side: Price & Purchased Date */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#0ea5e9",
                    fontSize: { xs: "1rem", sm: "1.15rem" },
                    lineHeight: 1,
                  }}
                >
                  {discountedPrice != null
                    ? `${discountedPrice.toLocaleString()}đ`
                    : "Free"}
                </Typography>
                {originalPrice != null && originalPrice > discountedPrice && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#94a3b8",
                      textDecoration: "line-through",
                      fontWeight: 600,
                      fontSize: { xs: "0.75rem", sm: "0.8rem" },
                    }}
                  >
                    {originalPrice.toLocaleString()}đ
                  </Typography>
                )}
              </Box>

              {tabContext === "order" && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    fontWeight: 500,
                    fontSize: { xs: "0.775rem", sm: "0.85rem" },
                  }}
                >
                  Purchased:{" "}
                  <span style={{ color: "#334155", fontWeight: 600 }}>
                    {formatServerDate(item.timestamp || item.createdAt)}
                  </span>
                </Typography>
              )}
            </Box>

            {/* Right Side: Action Button */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {tabContext === "order" && orderStatus === "COMPLETED" && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Star size={15} />}
                  onClick={() => setReviewDialogOpen(true)}
                  sx={{
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: { xs: "0.8rem", sm: "0.85rem" },
                    borderColor: "#cbd5e1",
                    color: "#475569",
                    py: 0.5,
                    px: 1.5,
                    "&:hover": {
                      bgcolor: "#f8fafc",
                      borderColor: "#94a3b8",
                    },
                  }}
                >
                  Review Now
                </Button>
              )}

              {tabContext === "enrolled" && (
                <Button
                  component={Link}
                  href={`/courses/${courseId}/lectures`}
                  variant="contained"
                  size="small"
                  startIcon={<PlayCircle size={15} />}
                  sx={{
                    bgcolor: "#0ea5e9",
                    color: "#fff",
                    borderRadius: "20px",
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                    px: 2.5,
                    py: 0.6,
                    boxShadow: "0 4px 14px rgba(14,165,233,0.25)",
                    "&:hover": {
                      bgcolor: "#0284c7",
                      boxShadow: "0 6px 20px rgba(14,165,233,0.35)",
                    },
                  }}
                >
                  Learn Now
                </Button>
              )}
            </Box>
          </Box>
        </Stack>
      </CardContent>

      <ReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        courseId={courseId}
      />
    </Card>
  );
}
