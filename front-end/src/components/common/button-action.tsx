import {
  Tooltip,
  IconButton,
  IconButtonProps,
  TooltipProps,
  useTheme,
  alpha,
} from "@mui/material";
import { ReactNode } from "react";

type ButtonActionProps = {
  tooltip?: ReactNode;
  icon: ReactNode;
  variant?: "contained" | "soft";
  color?: "primary" | "error" | "success" | "warning" | "info" | "default";

  /**
   * Custom gradient background
   */
  background?: string;

  /**
   * Custom shadow color
   */
  shadowColor?: string;
} & Omit<IconButtonProps, "color"> & {
    tooltipProps?: Partial<TooltipProps>;
  };

export default function ButtonAction({
  tooltip,
  icon,
  tooltipProps,
  sx,
  variant = "contained",
  color = "primary",
  background,
  shadowColor,
  disabled,
  ...props
}: ButtonActionProps) {
  const theme = useTheme();

  // Helper to get color values
  const getColorValue = () => {
    switch (color) {
      case "error":
        return { main: theme.palette.error.main, dark: theme.palette.error.dark, light: theme.palette.error.light };
      case "success":
        return { main: theme.palette.success.main, dark: theme.palette.success.dark, light: theme.palette.success.light };
      case "warning":
        return { main: theme.palette.warning.main, dark: theme.palette.warning.dark, light: theme.palette.warning.light };
      case "info":
        return { main: theme.palette.info.main, dark: theme.palette.info.dark, light: theme.palette.info.light };
      case "default":
        return { main: theme.palette.grey[500], dark: theme.palette.grey[700], light: theme.palette.grey[300] };
      case "primary":
      default:
        return { main: "#3b82f6", dark: "#2563eb", light: "#60a5fa" };
    }
  };

  const c = getColorValue();
  const activeBackground = background || `linear-gradient(135deg, ${c.main} 0%, ${c.dark} 100%)`;
  const activeShadow = shadowColor || alpha(c.main, 0.24);

  let styles = {};

  if (variant === "contained") {
    styles = {
      background: activeBackground,
      color: "white",
      boxShadow: `0 8px 20px ${activeShadow}`,
      "&:hover": {
        transform: "translateY(-2px) scale(1.04)",
        boxShadow: `0 12px 28px ${alpha(c.main, 0.32)}`,
        filter: "brightness(1.04)",
      },
    };
  } else if (variant === "soft") {
    styles = {
      color: disabled ? "action.disabled" : (color === "error" ? theme.palette.error.main : c.dark),
      bgcolor: disabled ? "transparent" : alpha(c.main, 0.08),
      "&:hover": disabled
        ? {}
        : {
            bgcolor: alpha(c.main, 0.16),
            color: color === "error" ? theme.palette.error.dark : c.dark,
            transform: "translateY(-2px) scale(1.05)",
            boxShadow: `0 6px 14px ${alpha(c.main, 0.16)}`,
          },
    };
  }

  const button = (
    <IconButton
      disabled={disabled}
      {...props}
      sx={{
        width: variant === "soft" ? 34 : 36,
        height: variant === "soft" ? 34 : 36,
        borderRadius: variant === "soft" ? 2 : 3,
        transition: "all 0.2s ease",
        "&:active": disabled
          ? {}
          : {
              transform: "scale(0.96)",
            },
        ...styles,
        ...sx,
      }}
    >
      {icon}
    </IconButton>
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip} arrow {...tooltipProps}>
        {disabled ? <span>{button}</span> : button}
      </Tooltip>
    );
  }

  return button;
}
