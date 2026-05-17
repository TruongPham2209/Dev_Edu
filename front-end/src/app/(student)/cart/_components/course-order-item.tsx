import { Box, Card, CardContent, Checkbox, IconButton, Typography, Button, Chip } from "@mui/material";
import { Trash2, PlayCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { CourseItemDetailResponse } from "@/lib/api/types";

interface CourseOrderItemProps {
  item: CourseItemDetailResponse | any;
  tabContext: "cart" | "order" | "enrolled";
  onRemove?: (id: string) => void;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
}

export function CourseOrderItem({
  item,
  tabContext,
  onRemove,
  selected,
  onSelect,
}: CourseOrderItemProps) {
  const title = item.title || "Khóa học";
  const thumbnailUrl = item.thumbnailUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300&auto=format&fit=crop";
  const courseId = item.courseId || item.id;
  const originalPrice = item.originalPrice;
  const discountedPrice = item.discountedPrice ?? item.price;

  return (
    <Card
      sx={{
        borderRadius: 4,
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
      <CardContent sx={{ p: { xs: 2, sm: 3 }, display: "flex", alignItems: "stretch", gap: 2.5, flexDirection: { xs: "column", sm: "row" }, flex: 1 }}>
        {tabContext === "cart" && onSelect && (
          <Box sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}>
            <Checkbox
              checked={!!selected}
              onChange={(e) => onSelect(item.id, e.target.checked)}
              sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#0284c7" } }}
            />
          </Box>
        )}
        
        <Box
          component={Link}
          href={`/courses?id=${courseId}`}
          sx={{
            width: { xs: "100%", sm: 160 },
            height: { xs: 180, sm: "auto" },
            minHeight: { sm: 120 },
            borderRadius: 3,
            overflow: "hidden",
            flexShrink: 0,
            position: "relative",
            display: "block",
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0, left: 0, right: 0, bottom: 0,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
              borderRadius: 3,
            }
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.5, width: "100%", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                component={Link}
                href={`/courses?id=${courseId}`}
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
                  {item.description}
                </Typography>
              )}
            </Box>
            
            {tabContext === "cart" && onRemove && (
              <IconButton
                onClick={() => onRemove(item.id)}
                size="small"
                sx={{ color: "#94a3b8", flexShrink: 0, "&:hover": { color: "#ef4444", bgcolor: "#fee2e2" } }}
              >
                <Trash2 size={18} />
              </IconButton>
            )}

            {tabContext === "order" && (
              <Chip
                icon={<CheckCircle2 size={14} />}
                label="Thành công"
                size="small"
                sx={{ 
                  bgcolor: "#dcfce7", 
                  color: "#166534", 
                  fontWeight: 700,
                  "& .MuiChip-icon": { color: "#166534" }
                }}
              />
            )}
          </Box>

          <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
            {tabContext === "cart" && (
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0ea5e9", lineHeight: 1, mb: 0.5 }}>
                  {discountedPrice != null ? `${discountedPrice.toLocaleString()}đ` : "Miễn phí"}
                </Typography>
                {originalPrice != null && originalPrice > discountedPrice && (
                  <Typography variant="caption" sx={{ color: "#94a3b8", textDecoration: "line-through", fontWeight: 600 }}>
                    {originalPrice.toLocaleString()}đ
                  </Typography>
                )}
              </Box>
            )}

            {tabContext === "order" && (
              <Box>
                <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Thanh toán lúc: {item.timestamp || item.createdAt ? new Date(item.timestamp || item.createdAt).toLocaleDateString("vi-VN") : "N/A"}
                </Typography>
              </Box>
            )}
            
            {tabContext === "enrolled" && (
              <Button
                component={Link}
                href={`/courses?id=${courseId}`}
                variant="contained"
                size="small"
                startIcon={<PlayCircle size={16} />}
                sx={{
                  bgcolor: "#0f172a",
                  borderRadius: 50,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1e293b", boxShadow: "0 4px 12px rgba(15,23,42,0.2)" },
                }}
              >
                Vào học ngay
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
