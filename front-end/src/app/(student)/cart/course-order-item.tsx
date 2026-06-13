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
  Typography,
} from "@mui/material";
import { CheckCircle2, PlayCircle, Star, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ReviewDialog } from "./review-dialog";

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
          p: { xs: 1, sm: 2 },
          display: "flex",
          alignItems: "stretch",
          gap: 2.5,
          flexDirection: { xs: "column", sm: "row" },
          flex: 1,
        }}
      >
        {tabContext === "cart" && onSelect && (
          <Box sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
            <Checkbox
              checked={!!selected}
              onChange={(e) => onSelect(courseId, e.target.checked)}
              sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#0284c7" } }}
            />
          </Box>
        )}

        <Box
          component={Link}
          href={`/courses/${courseId}`}
          sx={{
            width: { xs: "100%", sm: 160 },
            height: { xs: 180, sm: "auto" },
            minHeight: { sm: 120 },
            borderRadius: 1,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
            display: "block",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
              borderRadius: 1,
            },
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                component={Link}
                href={`/courses/${courseId}`}
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  textDecoration: "none",
                  fontSize: "1.1rem",
                  lineHeight: 1.4,
                  mb: 0.5,
                  "&:hover": { color: "#0284c7" },
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {title}
              </Typography>
              {item.description && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    lineHeight: 1.6,
                  }}
                >
                  {stripHtml(item.description)}
                </Typography>
              )}
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
                  "& .MuiChip-icon": { color: "#166534" },
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              mt: "auto",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            {tabContext === "cart" && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#0ea5e9",
                    lineHeight: 1,
                    mb: 0.5,
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
                    }}
                  >
                    {originalPrice.toLocaleString()}đ
                  </Typography>
                )}
              </Box>
            )}

            {tabContext === "order" && (
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "#0f172a",
                    lineHeight: 1,
                    mb: 0.5,
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
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    {originalPrice.toLocaleString()}đ
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 600 }}
                >
                  Purchased at:{" "}
                  {formatServerDate(item.timestamp || item.createdAt)}
                </Typography>
                {orderStatus === "COMPLETED" && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Star size={16} />}
                    onClick={() => setReviewDialogOpen(true)}
                    sx={{
                      mt: 1.5,
                      borderRadius: 8,
                      textTransform: "none",
                      fontWeight: 600,
                      borderColor: "#cbd5e1",
                      color: "#475569",
                      "&:hover": {
                        bgcolor: "#f8fafc",
                        borderColor: "#94a3b8",
                      },
                    }}
                  >
                    Review Now
                  </Button>
                )}
              </Box>
            )}

            {tabContext === "enrolled" && (
              <Button
                component={Link}
                href={`/courses/${courseId}/lectures`}
                variant="contained"
                size="small"
                startIcon={<PlayCircle size={16} />}
                sx={{
                  bgcolor: "#0ea5e9",
                  color: "#fff",

                  borderRadius: 50,
                  textTransform: "none",

                  fontWeight: 700,
                  px: 3,
                  py: 1,

                  boxShadow: "0 4px 14px rgba(14,165,233,0.25)",

                  "&:hover": {
                    bgcolor: "#0284c7",
                    boxShadow: "0 6px 20px rgba(14,165,233,0.35)",
                    transform: "translateY(-1px)",
                  },

                  transition: "all .2s ease",
                }}
              >
                Enroll
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>

      <ReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        courseId={courseId}
      />
    </Card>
  );
}
