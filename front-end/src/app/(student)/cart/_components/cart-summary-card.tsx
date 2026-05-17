import { Box, Paper, Typography, Button, Container } from "@mui/material";
import { CreditCard, ShieldCheck } from "lucide-react";

interface CartSummaryCardProps {
  totalItems: number;
  totalPrice: number;
  onCheckout: () => void;
  isCheckoutLoading: boolean;
}

export function CartSummaryCard({
  totalItems,
  totalPrice,
  onCheckout,
  isCheckoutLoading,
}: CartSummaryCardProps) {
  return (
    <Paper
      elevation={24}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderRadius: "24px 24px 0 0",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        bgcolor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
      }}
    >
      <Container maxWidth="lg" sx={{ py: 2.5, px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
          }}
        >
          {/* Left Side: Summary Info */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Box>
              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, mb: 0.5 }}>
                Đã chọn:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                {totalItems} khóa học
              </Typography>
            </Box>

            <Box sx={{ width: "1px", height: "40px", bgcolor: "rgba(0,0,0,0.1)", display: { xs: "none", sm: "block" } }} />

            <Box>
              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 600, mb: 0.5 }}>
                Tổng cộng:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: "#0ea5e9", lineHeight: 1 }}>
                {totalPrice.toLocaleString()}đ
              </Typography>
            </Box>
          </Box>

          {/* Right Side: Actions */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "stretch", sm: "flex-end" }, gap: 1 }}>
            <Button
              variant="contained"
              disabled={totalItems === 0 || isCheckoutLoading}
              onClick={onCheckout}
              startIcon={<CreditCard size={20} />}
              sx={{
                py: 1.5,
                px: 5,
                borderRadius: 50,
                textTransform: "none",
                fontWeight: 800,
                fontSize: "1.05rem",
                bgcolor: "#0ea5e9",
                boxShadow: "0 8px 20px -5px rgba(14, 165, 233, 0.4)",
                "&:hover": { bgcolor: "#0284c7", boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.5)", transform: "translateY(-1px)" },
                "&:disabled": {
                  bgcolor: "#e2e8f0",
                  color: "#94a3b8",
                  boxShadow: "none",
                },
                transition: "all 0.2s"
              }}
            >
              {isCheckoutLoading ? "Đang xử lý..." : "Thanh toán ngay"}
            </Button>
            
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, color: "#64748b" }}>
              <ShieldCheck size={14} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                Thanh toán an toàn & bảo mật
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Paper>
  );
}
