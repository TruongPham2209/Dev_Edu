import type { CourseResponse, LectureResponse } from "@/lib/api/types";
import { Box, Button, Stack, Typography } from "@mui/material";
import {
  Award,
  BookOpen,
  Loader2,
  PlayCircle,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";

export interface CoursePurchaseCardProps {
  course: CourseResponse;
  isEnrolled: boolean;
  lectures: LectureResponse[];
  handleBuyNow: () => void;
  handleAddToCart: () => void;
  loadingAction: "buy" | "cart" | null;
}

export function CoursePurchaseCard({
  course,
  isEnrolled,
  lectures,
  handleBuyNow,
  handleAddToCart,
  loadingAction,
}: CoursePurchaseCardProps) {
  const isFree =
    course.originalPrice === 0 ||
    (course.discountedPercentage && course.discountedPercentage >= 100);
  const displayPrice =
    course.discountedPercentage && course.originalPrice
      ? course.originalPrice * (1 - course.discountedPercentage / 100)
      : course.originalPrice;

  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return "Đang cập nhật";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Đang cập nhật";
    return d.toLocaleDateString("vi-VN");
  };

  return (
    <Box
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(16px)",
        color: "white",
        mb: 4,
      }}
    >
      <Box
        sx={{
          position: "relative",
          paddingTop: "56.25%",
          bgcolor: "rgba(0,0,0,0.3)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {course.thumbnailUrl || course.thumbnailObjectKey ? (
          <Box
            component="img"
            src={course.thumbnailUrl || course.thumbnailObjectKey}
            alt={course.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              p: 2,
              transition: "transform 0.5s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              background:
                "linear-gradient(135deg, rgba(51,65,85,0.5) 0%, rgba(15,23,42,0.8) 100%)",
            }}
          >
            <PlayCircle
              size={64}
              color="rgba(255,255,255,0.8)"
              strokeWidth={1.5}
            />
            <Typography
              sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}
            >
              Xem trước khóa học
            </Typography>
          </Box>
        )}
        {/* Play Overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(0,0,0,0.4)",
            opacity: 0,
            transition: "opacity 0.2s",
            "&:hover": { opacity: 1 },
            cursor: "pointer",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            }}
          >
            <PlayCircle size={32} color="white" />
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 3 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: isFree ? "#34d399" : "white",
              letterSpacing: "-0.02em",
            }}
          >
            {isFree ? "Miễn phí" : `${displayPrice?.toLocaleString("vi-VN")}đ`}
          </Typography>
          {!isFree &&
            course.originalPrice &&
            course.originalPrice !== displayPrice && (
              <Typography
                variant="h6"
                sx={{
                  textDecoration: "line-through",
                  color: "#94a3b8",
                  fontWeight: 500,
                }}
              >
                {course.originalPrice.toLocaleString("vi-VN")}đ
              </Typography>
            )}
        </Box>

        <Stack spacing={2} sx={{ mb: 3 }}>
          {isEnrolled ? (
            <Button
              component={Link}
              href={`/courses/${course.id}/lectures`}
              variant="contained"
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: "1rem",
                background: "linear-gradient(to right, #3b82f6, #6366f1)",
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
                "&:hover": {
                  background: "linear-gradient(to right, #2563eb, #4f46e5)",
                  boxShadow: "0 15px 20px -3px rgba(59, 130, 246, 0.4)",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s ease",
              }}
              startIcon={<PlayCircle size={24} />}
            >
              Vào học ngay
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleBuyNow}
                disabled={loadingAction !== null}
                sx={{
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: "1rem",
                  background: "linear-gradient(to right, #e11d48, #be123c)",
                  boxShadow: "0 10px 15px -3px rgba(225, 29, 72, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(to right, #be123c, #9f1239)",
                    boxShadow: "0 15px 20px -3px rgba(225, 29, 72, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Đăng ký ngay
              </Button>
              <Button
                variant="outlined"
                fullWidth
                size="large"
                onClick={handleAddToCart}
                disabled={loadingAction !== null}
                sx={{
                  py: 1.75,
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: "1rem",
                  borderWidth: 2,
                  borderColor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: "rgba(255,255,255,0.4)",
                    bgcolor: "rgba(255,255,255,0.05)",
                  },
                }}
                startIcon={
                  loadingAction === "cart" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ShoppingCart size={20} />
                  )
                }
              >
                {loadingAction === "cart"
                  ? "Đang xử lý..."
                  : "Thêm vào giỏ hàng"}
              </Button>
            </>
          )}
        </Stack>

        {/* Additional information */}
        <Box sx={{ pt: 3, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <Typography
            sx={{ fontWeight: 800, mb: 2.5, fontSize: "1rem", color: "white" }}
          >
            Khóa học này bao gồm:
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <PlayCircle size={16} color="#94a3b8" />
              </Box>
              <Typography sx={{ color: "#e2e8f0", fontWeight: 500 }}>
                {lectures.length} Bài giảng chất lượng cao
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BookOpen size={16} color="#94a3b8" />
              </Box>
              <Typography sx={{ color: "#e2e8f0", fontWeight: 500 }}>
                Tài liệu học tập trọn đời
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Award size={16} color="#94a3b8" />
              </Box>
              <Typography sx={{ color: "#e2e8f0", fontWeight: 500 }}>
                Chứng chỉ hoàn thành khóa học
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
