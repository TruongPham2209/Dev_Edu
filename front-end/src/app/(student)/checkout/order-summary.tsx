"use client";

import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { Lock } from "lucide-react";

interface OrderSummaryProps {
  subtotal: number;
  discount: number;
  total: number;
  onProceed: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export function OrderSummary({
  subtotal,
  discount,
  total,
  onProceed,
  onCancel,
  isProcessing,
}: OrderSummaryProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: { xs: "none", md: "1px solid" },
        borderTop: { xs: "1px solid", md: "1px solid" },
        borderColor: "divider",
        position: { xs: "fixed", md: "sticky" },
        bottom: { xs: 0, md: "auto" },
        left: { xs: 0, md: "auto" },
        right: { xs: 0, md: "auto" },
        width: { xs: "100%", md: "auto" },
        top: { xs: "auto", md: 100 },
        zIndex: { xs: 1000, md: "auto" },
        borderRadius: { xs: "24px 24px 0 0", md: 4 },
        boxShadow: { xs: "0 -8px 30px rgba(0,0,0,0.1)", md: "none" },
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 800, mb: 3, display: { xs: "none", md: "block" } }}
      >
        Order Summary
      </Typography>

      <Stack spacing={2} sx={{ mb: 3, display: { xs: "none", md: "flex" } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            Subtotal
          </Typography>
          <Typography
            variant="body1"
            sx={{ fontWeight: 600, fontSize: "1.1rem", color: "text.primary" }}
          >
            {subtotal.toLocaleString("vi-VN")}đ
          </Typography>
        </Box>

        {discount > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="body1"
              sx={{ fontWeight: 600, color: "error.main" }}
            >
              Discount
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                fontSize: "1.1rem",
                bgcolor: "error.50",
                color: "error.main",
                px: 1,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              -{discount.toLocaleString("vi-VN")}đ
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1, borderStyle: "dashed" }} />
      </Stack>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: { xs: 2, md: 3 },
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "text.secondary" }}
        >
          Total Amount
        </Typography>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: "primary.main",
            background: (theme) =>
              `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0px 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          {total.toLocaleString("vi-VN")}đ
        </Typography>
      </Box>

      {discount > 0 && (
        <Box
          sx={{
            bgcolor: "success.50",
            color: "success.dark",
            p: 1.5,
            borderRadius: 2.5,
            mb: 3,
            textAlign: "center",
            fontWeight: 800,
            display: { xs: "none", md: "block" },
          }}
        >
          You save {discount.toLocaleString("vi-VN")}đ today
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={onProceed}
        disabled={isProcessing}
        startIcon={<Lock size={18} />}
        sx={{
          py: 2,
          borderRadius: 3,
          fontWeight: 800,
          fontSize: "1.1rem",
          textTransform: "none",
          boxShadow: (theme) => `0 8px 16px ${theme.palette.primary.main}40`,
          "&:hover": {
            boxShadow: (theme) => `0 12px 24px ${theme.palette.primary.main}60`,
            transform: "translateY(-1px)",
          },
          transition: "all 0.2s",
        }}
      >
        {isProcessing ? "Processing..." : "Pay Securely Now"}
      </Button>

      <Button
        variant="outlined"
        color="error"
        fullWidth
        size="large"
        onClick={onCancel}
        disabled={isProcessing}
        sx={{
          py: 1.5,
          mt: 2,
          borderRadius: 3,
          fontWeight: 700,
          textTransform: "none",
        }}
      >
        {isProcessing ? "Cancelling..." : "Cancel Transaction"}
      </Button>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          textAlign: "center",
          mt: 2,
          fontWeight: 500,
          display: { xs: "none", md: "block" },
        }}
      >
        By completing your purchase you agree to these Terms of Service.
      </Typography>
    </Paper>
  );
}
