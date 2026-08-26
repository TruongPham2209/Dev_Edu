"use client";

import { Box, Button, Chip, Stack } from "@mui/material";
import { ChevronLeft, ShieldCheck } from "lucide-react";

interface CheckoutHeaderProps {
  onBack: () => void;
  disabled?: boolean;
}

export function CheckoutHeader({ onBack, disabled }: CheckoutHeaderProps) {
  return (
    <Box sx={{ mb: { xs: 2.5, sm: 4 } }}>
      <Button
        startIcon={<ChevronLeft size={18} />}
        onClick={onBack}
        disabled={disabled}
        sx={{
          mb: { xs: 1.5, sm: 2 },
          color: "text.secondary",
          fontWeight: 600,
          fontSize: { xs: "0.85rem", sm: "0.95rem" },
          textTransform: "none",
        }}
      >
        Back to Cart
      </Button>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 1.5,
        }}
      >
        <Chip
          icon={<ShieldCheck size={16} />}
          label="Secure Checkout"
          color="success"
          variant="outlined"
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            pl: 0.5,
            borderWidth: 2,
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
          }}
        />
      </Stack>
    </Box>
  );
}
