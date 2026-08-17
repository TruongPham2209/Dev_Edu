"use client";

import {
  alpha,
  Box,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef, useId, useState } from "react";

export interface FormInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  error?: boolean;
  helperText?: ReactNode;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  onIconClick?: () => void;
  fullWidth?: boolean;
  multiline?: boolean;
  minRows?: number;
  characterCount?: number;
  maxLength?: number;
  slotProps?: {
    htmlInput?: React.InputHTMLAttributes<
      HTMLInputElement | HTMLTextAreaElement
    >;
  };
}

export const FormInput = forwardRef<any, FormInputProps>(
  (
    {
      label,
      error = false,
      helperText,
      icon,
      iconPosition = "start",
      onIconClick,
      disabled = false,
      fullWidth = true,
      multiline = false,
      minRows,
      characterCount,
      maxLength,
      slotProps,
      ...props
    },
    ref,
  ) => {
    const theme = useTheme();
    const inputId = useId();

    const [focused, setFocused] = useState(false);

    const isStart = iconPosition === "start";

    return (
      <Stack
        component="div"
        sx={{
          width: fullWidth ? "100%" : undefined,
          position: "relative",
          mt: 1,
        }}
      >
        {/* Label */}
        {label && (
          <Typography
            component="label"
            htmlFor={inputId}
            sx={{
              position: "absolute",
              top: -9,
              left: 14,
              zIndex: 2,
              px: 0.5,
              backgroundColor: theme.palette.background.paper,
              fontSize: 12,
              fontWeight: 600,
              color: error
                ? theme.palette.error.main
                : focused
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
              transition: "all .2s ease",
            }}
          >
            {label}
          </Typography>
        )}

        {/* Input Wrapper */}
        <Box
          sx={{
            position: "relative",
            display: "flex",
            alignItems: "stretch",
            minHeight: { xs: 40, sm: 44 },
            borderRadius: "12px",
            overflow: multiline ? "hidden" : "visible",

            backgroundColor: alpha(theme.palette.background.paper, 0.9),

            border: `1.5px solid ${
              error
                ? theme.palette.error.main
                : focused
                  ? alpha(theme.palette.primary.main, 0.8)
                  : alpha(theme.palette.divider, 0.9)
            }`,

            boxShadow: focused
              ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}`
              : "0 2px 10px rgba(0,0,0,0.04)",

            transition: "all .22s ease",

            "&:hover": {
              borderColor: error
                ? theme.palette.error.main
                : focused
                  ? theme.palette.primary.main
                  : alpha(theme.palette.text.primary, 0.28),
            },

            ...(disabled && {
              opacity: 0.65,
              pointerEvents: "none",
            }),
          }}
        >
          {/* Start Icon */}
          {icon && isStart && (
            <Box
              sx={{
                width: { xs: 38, sm: 44 },
                minWidth: { xs: 38, sm: 44 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                background: focused
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.text.primary, 0.04),

                borderRight: `1px solid ${alpha(theme.palette.divider, 0.8)}`,

                color: focused
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,

                transition: "all .22s ease",
                borderTopLeftRadius: "10.5px",
                borderBottomLeftRadius: "10.5px",
              }}
            >
              {onIconClick ? (
                <IconButton
                  onClick={onIconClick}
                  size="small"
                  disableRipple
                  tabIndex={-1}
                  sx={{
                    color: "inherit",
                  }}
                >
                  {icon}
                </IconButton>
              ) : (
                icon
              )}
            </Box>
          )}

          {/* Input */}
          <Box
            component={multiline ? "textarea" : "input"}
            id={inputId}
            ref={ref}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={disabled}
            rows={multiline ? minRows : undefined}
            {...props}
            {...(slotProps?.htmlInput || {})}
            sx={{
              flex: 1,
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              resize: multiline ? "vertical" : "none",
              fontFamily: "inherit",

              px: { xs: 1.5, sm: 1.75 },
              py: { xs: 0.9, sm: 1.15 },

              fontSize: { xs: 13.5, sm: 14 },
              fontWeight: 500,
              color: theme.palette.text.primary,

              "&::placeholder": {
                color: alpha(theme.palette.text.secondary, 0.7),
                opacity: 1,
              },

              "&:-webkit-autofill": {
                WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
                WebkitTextFillColor: theme.palette.text.primary,
              },
            }}
          />

          {/* End Icon */}
          {icon && !isStart && (
            <Box
              sx={{
                width: 44,
                minWidth: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                background: focused
                  ? alpha(theme.palette.primary.main, 0.1)
                  : alpha(theme.palette.text.primary, 0.04),

                borderLeft: `1px solid ${alpha(theme.palette.divider, 0.8)}`,

                color: focused
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,

                transition: "all .22s ease",
                borderTopRightRadius: "10.5px",
                borderBottomRightRadius: "10.5px",
              }}
            >
              {onIconClick ? (
                <IconButton
                  onClick={onIconClick}
                  size="small"
                  disableRipple
                  tabIndex={-1}
                  sx={{
                    color: "inherit",
                  }}
                >
                  {icon}
                </IconButton>
              ) : (
                icon
              )}
            </Box>
          )}
        </Box>

        {/* Helper Text & Character Count */}
        <Box
          component="div"
          sx={{
            minHeight: 20,
            px: 0.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box component="div" sx={{ flex: 1 }}>
            {error && helperText && (
              <Typography
                variant="caption"
                color="error"
                sx={{
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                {helperText}
              </Typography>
            )}
          </Box>
          {characterCount !== undefined && maxLength !== undefined && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1, whiteSpace: "nowrap" }}
            >
              {characterCount}/{maxLength}
            </Typography>
          )}
        </Box>
      </Stack>
    );
  },
);

FormInput.displayName = "FormInput";
