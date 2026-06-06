import { Box, Button, Chip, Container, Paper, Typography } from "@mui/material";
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

        bgcolor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",

        boxShadow: "0 -8px 32px rgba(0,0,0,0.08)",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          py: 2,
          px: {
            xs: 2,
            md: 3,
          },
          minWidth: "75%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: {
              xs: "column",
              md: "row",
            },
            justifyContent: "space-between",
            alignItems: {
              xs: "stretch",
              md: "center",
            },
            gap: 2,
          }}
        >
          {/* LEFT */}
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 0.5,
                fontWeight: 600,
              }}
            >
              {totalItems} courses in cart
            </Typography>

            <Typography
              sx={{
                fontSize: {
                  xs: "1.75rem",
                  md: "2rem",
                },
                fontWeight: 800,
                color: "primary.main",
                lineHeight: 1,
              }}
            >
              {totalFinalPrice.toLocaleString()}đ
            </Typography>

            <Box
              sx={{
                mt: 0.75,
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {totalDiscountAmount > 0 && (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      textDecoration: "line-through",
                      color: "text.secondary",
                    }}
                  >
                    {totalOriginalPrice.toLocaleString()}đ
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "success.main",
                      fontWeight: 700,
                    }}
                  >
                    You saved {totalDiscountAmount.toLocaleString()}đ
                  </Typography>

                  <Chip
                    label={`-${discountPercent}%`}
                    size="small"
                    color="success"
                    sx={{
                      fontWeight: 700,
                    }}
                  />
                </>
              )}
            </Box>

            <Box
              sx={{
                mt: 1,
                display: "flex",
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

          {/* RIGHT */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: {
                xs: "stretch",
                md: "flex-end",
              },
              gap: 1,
              minWidth: {
                md: 150,
              },
            }}
          >
            <Button
              fullWidth
              variant="contained"
              disabled={totalItems === 0 || isCheckoutLoading}
              onClick={onCheckout}
              startIcon={<CreditCard size={20} />}
              sx={{
                height: 56,

                borderRadius: 3,

                textTransform: "none",

                fontWeight: 800,
                fontSize: "1rem",

                boxShadow: "0 8px 24px rgba(25,118,210,0.25)",

                "&:hover": {
                  transform: "translateY(-1px)",
                },
              }}
            >
              {isCheckoutLoading ? "Processing..." : `Checkout`}
            </Button>

            {totalDiscountAmount > 0 && (
              <Typography
                variant="caption"
                color="success.main"
                sx={{
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                You saved {totalDiscountAmount.toLocaleString()}đ
              </Typography>
            )}
          </Box>
        </Box>
      </Container>
    </Paper>
  );
}
