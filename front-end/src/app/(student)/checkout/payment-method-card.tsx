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
        borderRadius: { xs: 2, sm: 2.5 },
        p: { xs: 1.5, sm: 2.5 },
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
        gap: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          width: { xs: 56, sm: 80 },
          height: { xs: 46, sm: 64 },
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 1,
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
              width: { xs: 34, sm: 48 },
              height: { xs: 34, sm: 48 },
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
              fontSize: { xs: "0.9rem", sm: "1.05rem" },
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
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            />
          )}

          {disabled && (
            <Chip
              size="small"
              label="Coming Soon"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 700,
              }}
            />
          )}
        </Box>

        <Typography
          variant="body2"
          color={disabled ? "text.disabled" : "text.secondary"}
          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, lineHeight: 1.4 }}
        >
          {description}
        </Typography>
      </Box>

      {/* Radio */}
      <Box
        sx={{
          width: { xs: 20, sm: 24 },
          height: { xs: 20, sm: 24 },
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
              width: { xs: 10, sm: 12 },
              height: { xs: 10, sm: 12 },
              borderRadius: "50%",
              bgcolor: "primary.main",
            }}
          />
        )}
      </Box>
    </Box>
  );
}
