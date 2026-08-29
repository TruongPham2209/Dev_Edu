import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Typography,
  alpha,
} from "@mui/material";
import { CreditCard, ShieldCheck } from "lucide-react";

interface CartSummaryCardProps {
  totalItems: number;
  totalOriginalPrice: number;
  totalDiscountAmount: number;
  totalFinalPrice: number;
  onCheckout: () => void;
  isCheckoutLoading: boolean;
}

export function CartSummaryCard({
  totalItems,
  totalOriginalPrice,
  totalDiscountAmount,
  totalFinalPrice,
  onCheckout,
  isCheckoutLoading,
}: CartSummaryCardProps) {
  const discountPercent =
    totalOriginalPrice > 0
      ? Math.round((totalDiscountAmount / totalOriginalPrice) * 100)
      : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,

        borderTop: "1px solid",
        borderColor: "divider",

        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.95),
        backdropFilter: "blur(16px)",

        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 -8px 32px rgba(0,0,0,0.6)"
            : "0 -8px 32px rgba(0,0,0,0.08)",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 1.25, sm: 2 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {/* LEFT: Price & Info */}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.25,
                fontWeight: 600,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
              }}
            >
              {totalItems} courses in cart
            </Typography>

            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, flexWrap: "wrap" }}>
              <Typography
                sx={{
                  fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2rem" },
                  fontWeight: 800,
                  color: "primary.main",
                  lineHeight: 1.1,
                }}
              >
                {totalFinalPrice.toLocaleString()}đ
              </Typography>

              {totalDiscountAmount > 0 && (
                <Chip
                  label={`-${discountPercent}%`}
                  size="small"
                  color="success"
                  sx={{
                    fontWeight: 700,
                    height: { xs: 20, sm: 24 },
                    fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  }}
                />
              )}
            </Box>

            {totalDiscountAmount > 0 && (
              <Box
                sx={{
                  mt: 0.25,
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                    fontSize: "0.8rem",
                  }}
                >
                  {totalOriginalPrice.toLocaleString()}đ
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "success.main",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                  }}
                >
                  You saved {totalDiscountAmount.toLocaleString()}đ
                </Typography>
              </Box>
            )}

            <Box
              sx={{
                mt: 0.5,
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
                color: "text.secondary",
              }}
            >
              <ShieldCheck size={14} />

              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                }}
              >
                Lifetime access • Secure payment
              </Typography>
            </Box>
          </Box>

          {/* RIGHT: Checkout Action */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 0.5,
              flexShrink: 0,
            }}
          >
            <Button
              variant="contained"
              disabled={totalItems === 0 || isCheckoutLoading}
              onClick={onCheckout}
              startIcon={<CreditCard size={18} />}
              sx={{
                height: { xs: 44, sm: 50, md: 54 },
                px: { xs: 2.5, sm: 4 },
                borderRadius: 3,
                textTransform: "none",
                fontWeight: 800,
                fontSize: { xs: "0.875rem", sm: "1rem" },
                boxShadow: (theme) =>
                  `0 6px 20px ${alpha(theme.palette.primary.main, 0.25)}`,
                whiteSpace: "nowrap",
                "&:hover": {
                  transform: "translateY(-1px)",
                },
              }}
            >
              {isCheckoutLoading ? "Processing..." : "Checkout"}
            </Button>

            {totalDiscountAmount > 0 && (
              <Typography
                variant="caption"
                color="success.main"
                sx={{
                  display: { xs: "block", sm: "none" },
                  textAlign: "right",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              >
                Save {totalDiscountAmount.toLocaleString()}đ
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Paper>
  );
}
