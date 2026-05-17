import { Box, Typography, Stack } from "@mui/material";
import { ShoppingCart, BookOpen, Clock } from "lucide-react";

export function CartHeader() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: 220,
        borderRadius: { xs: 4, md: 6 },
        background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
        color: "#0f172a",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        mb: { xs: 4, md: 5 },
        boxShadow: "0 10px 40px -10px rgba(2, 132, 199, 0.15)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
        p: { xs: 4, md: 6, lg: 8 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
          width: "100%",
          zIndex: 1,
        }}
      >
        {/* Left Content */}
        <Box sx={{ flex: 1, maxWidth: 600 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              px: 2.5,
              py: 1,
              borderRadius: 10,
              mb: 3,
            }}
          >
            <ShoppingCart size={18} color="#0284c7" />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "#0369a1", letterSpacing: "0.02em" }}
            >
              Quản lý giao dịch
            </Typography>
          </Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 2,
              fontSize: { xs: "2.25rem", md: "3rem" },
              color: "#0f172a",
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Không gian học tập của bạn
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "#64748b", maxWidth: 500, lineHeight: 1.7, fontSize: "1.125rem", opacity: 0.9 }}
          >
            Quản lý các khóa học đang chọn, xem lại lịch sử giao dịch và tiếp tục hành trình nâng cấp bản thân ngay hôm nay.
          </Typography>
        </Box>

        {/* Right Content - Stats Card */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            bgcolor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(20px)",
            p: 3,
            borderRadius: 4,
            border: "1px solid rgba(255, 255, 255, 0.5)",
            boxShadow: "0 10px 30px -5px rgba(2, 132, 199, 0.1)",
            width: { xs: "100%", md: "auto" },
            minWidth: { md: 320 },
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "#e0f2fe", borderRadius: 2 }}>
                <BookOpen size={20} color="#0284c7" />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748b" }}>
                Khóa học
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", mt: 1 }}>
              12
            </Typography>
          </Box>

          <Box sx={{ width: "1px", bgcolor: "rgba(0,0,0,0.05)" }} />

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box sx={{ p: 1, bgcolor: "#e0f2fe", borderRadius: 2 }}>
                <Clock size={20} color="#0284c7" />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#64748b" }}>
                Đang học
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: "#0ea5e9", mt: 1 }}>
              5
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: "-50%",
          right: "-10%",
          width: "60%",
          height: "200%",
          background:
            "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
    </Box>
  );
}
