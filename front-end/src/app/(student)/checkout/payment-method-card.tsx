"use client";

import type { PaymentMethod } from "@/lib/type/enum";
import { alpha, Box, Chip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

interface PaymentMethodCardProps {
  method: PaymentMethod;
  name: string;
  description: string;
  logoUrl?: string;
  selected: boolean;
  disabled?: boolean;
  recommended?: boolean;
  onSelect: (method: PaymentMethod) => void;
}

export function PaymentMethodCard({
  method,
  name,
  description,
  logoUrl,
  selected,
  disabled,
  recommended,
  onSelect,
}: PaymentMethodCardProps) {
  const theme = useTheme();

  return (
    <Box
      onClick={() => {
        if (!disabled) onSelect(method);
      }}
      sx={{
        position: "relative",
        border: "2px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: 1,
        p: 2.5,
        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.04)
          : disabled
            ? alpha(theme.palette.action.disabledBackground, 0.2)
            : "background.paper",
        opacity: disabled ? 0.7 : 1,
        transition: "all 0.2s ease-in-out",
        cursor: disabled ? "not-allowed" : "pointer",
        "&:hover": {
          borderColor: disabled
            ? "divider"
            : selected
              ? "primary.main"
              : "text.secondary",
        },
        display: "flex",
        alignItems: "center",
        width: "100%",
        gap: 2,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: 80,
          height: 64,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 0.5,
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
        }}
      >
        {logoUrl && (
          <Box
            component="img"
            src={logoUrl}
            alt={name}
            sx={{
              width: 48,
              height: 48,
              objectFit: "contain",
              filter: disabled ? "grayscale(100%)" : "none",
              opacity: disabled ? 0.5 : 1,
            }}
          />
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            mb: 0.5,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 800,
              color: disabled ? "text.disabled" : "text.primary",
            }}
          >
            {name}
          </Typography>

          {recommended && !disabled && (
            <Chip
              size="small"
              label="Recommended"
              color="error"
              sx={{
                height: 22,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            />
          )}

          {disabled && (
            <Chip
              size="small"
              label="Coming Soon"
              sx={{
                height: 22,
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            />
          )}
        </Box>

        <Typography
          variant="body2"
          color={disabled ? "text.disabled" : "text.secondary"}
        >
          {description}
        </Typography>
      </Box>

      {/* Radio */}
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          border: "2px solid",
          borderColor: selected ? "primary.main" : "text.disabled",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          bgcolor: "background.paper",
        }}
      >
        {selected && (
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              bgcolor: "primary.main",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
