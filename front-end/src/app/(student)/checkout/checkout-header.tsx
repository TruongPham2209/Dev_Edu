"use client";

import { Box, Button, Chip, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChevronLeft, ShieldCheck } from "lucide-react";

interface CheckoutHeaderProps {
  onBack: () => void;
  disabled?: boolean;
}

export function CheckoutHeader({ onBack, disabled }: CheckoutHeaderProps) {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4 }}>
      <Button
        startIcon={<ChevronLeft size={18} />}
        onClick={onBack}
        disabled={disabled}
        sx={{
          mb: 2,
          color: "text.secondary",
          fontWeight: 600,
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
          gap: 2,
        }}
      >
        <Chip
          icon={<ShieldCheck size={18} />}
          label="Secure Checkout"
          color="success"
          variant="outlined"
          sx={{ fontWeight: 700, borderRadius: 2, pl: 0.5, borderWidth: 2 }}
        />
      </Stack>
    </Box>
  );
}
