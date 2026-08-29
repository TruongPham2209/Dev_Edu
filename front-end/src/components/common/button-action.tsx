import {
  alpha,
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
  useTheme,
} from "@mui/material";
import { ReactNode } from "react";

type ButtonActionProps = {
  tooltip?: ReactNode;
  icon: ReactNode;
  variant?: "contained" | "soft" | "soft-dark" | "outline";
  color?:
    | "primary"
    | "error"
    | "success"
    | "warning"
    | "info"
    | "default"
    | "secondary";

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
        return {
          main: theme.palette.error.main,
          dark: theme.palette.error.dark,
          light: theme.palette.error.light,
        };
      case "success":
        return {
          main: theme.palette.success.main,
          dark: theme.palette.success.dark,
          light: theme.palette.success.light,
        };
      case "warning":
        return {
          main: theme.palette.warning.main,
          dark: theme.palette.warning.dark,
          light: theme.palette.warning.light,
        };
      case "info":
        return {
          main: theme.palette.info.main,
          dark: theme.palette.info.dark,
          light: theme.palette.info.light,
        };
      case "default":
        return {
          main: theme.palette.grey[500],
          dark: theme.palette.grey[700],
          light: theme.palette.grey[300],
        };
      case "secondary":
        return {
          main: theme.palette.secondary.main,
          dark: theme.palette.secondary.dark,
          light: theme.palette.secondary.light,
        };
      case "primary":
      default:
        return {
          main: theme.palette.primary.main,
          dark: theme.palette.primary.dark,
          light: theme.palette.primary.light,
        };
    }
  };

  const c = getColorValue();
  const activeBackground =
    background || `linear-gradient(135deg, ${c.main} 0%, ${c.dark} 100%)`;
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
      color: disabled
        ? "action.disabled"
        : color === "error"
          ? theme.palette.error.main
          : c.dark,
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
  } else if (variant === "soft-dark") {
    styles = {
      color: disabled
        ? "action.disabled"
        : color === "error"
          ? theme.palette.error.dark
          : c.dark,
      bgcolor: disabled ? "transparent" : alpha(c.main, 0.15),
      "&:hover": disabled
        ? {}
        : {
            bgcolor: alpha(c.main, 0.25),
            color: color === "error" ? theme.palette.error.dark : c.dark,
            transform: "translateY(-2px) scale(1.05)",
            boxShadow: `0 6px 14px ${alpha(c.main, 0.2)}`,
          },
    };
  } else if (variant === "outline") {
    const isDefault = color === "default";
    styles = {
      color: disabled
        ? "action.disabled"
        : isDefault
          ? theme.palette.text.secondary
          : color === "error"
            ? theme.palette.error.main
            : c.main,
      border: "1px solid",
      borderColor: disabled
        ? "transparent"
        : isDefault
          ? theme.palette.divider
          : alpha(c.main, 0.3),
      bgcolor: "background.paper",
      "&:hover": disabled
        ? {}
        : {
            bgcolor: isDefault ? "action.hover" : alpha(c.main, 0.08),
            borderColor: isDefault ? theme.palette.primary.light : c.main,
            color: isDefault
              ? theme.palette.primary.main
              : color === "error"
                ? theme.palette.error.dark
                : c.dark,
            transform: "translateY(-2px) scale(1.04)",
            boxShadow: `0 8px 18px ${alpha(isDefault ? theme.palette.primary.main : c.main, 0.14)}`,
          },
    };
  }

  const button = (
    <IconButton
      disabled={disabled}
      {...props}
      sx={{
        width:
          variant === "outline" ? 38 : variant.startsWith("soft") ? 34 : 36,
        height:
          variant === "outline" ? 38 : variant.startsWith("soft") ? 34 : 36,
        borderRadius:
          variant === "outline" ? 2 : variant.startsWith("soft") ? 2 : 3,
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
