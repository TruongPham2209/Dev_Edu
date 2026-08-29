import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  IconButton,
  Typography,
  Zoom,
} from "@mui/material";
import { Loader2, X } from "lucide-react";
import React, { useEffect, useState } from "react";

export interface FormDialogProps extends Omit<
  DialogProps,
  "onSubmit" | "title"
> {
  open: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void> | void;
  title: string | React.ReactNode;
  headerIcon: React.ReactNode;
  cancelIcon?: React.ReactNode;
  submitIcon?: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  isSubmitDisabled?: boolean;
}

export function FormDialog({
  open,
  onClose,
  onSubmit,
  title,
  headerIcon,
  cancelIcon = <X size={18} />,
  submitIcon,
  submitText = "Confirm",
  cancelText = "Cancel",
  isSubmitDisabled = false,
  children,
  maxWidth = "md",
  ...props
}: FormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      maxWidth={maxWidth}
      fullWidth
      slots={{ transition: Zoom }}
      transitionDuration={250}
      slotProps={{
        backdrop: {
          timeout: 300,
          sx: {
            backdropFilter: "blur(10px)",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "radial-gradient(circle at center, rgba(0,0,0,0.6), rgba(0,0,0,0.85))"
                : "radial-gradient(circle at center, rgba(15,23,42,0.35), rgba(15,23,42,0.65))",
          },
        },
      }}
      sx={{
        "& .MuiDialog-paper": {
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: "20px", sm: "28px" },
          margin: { xs: 1.5, sm: 4 },
          width: { xs: "calc(100% - 24px)", sm: "100%" },
          border: "1px solid",
          borderColor: "divider",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.95))"
              : "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.92))",
          backdropFilter: "blur(20px)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 20px 60px rgba(0,0,0,0.6)"
              : "0 20px 60px rgba(15,23,42,0.25)",
        },

        "& .MuiDialog-paper::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          padding: "1px",
          borderRadius: { xs: "20px", sm: "28px" },
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(99,102,241,0.4), rgba(168,85,247,0.2), rgba(255,255,255,0.1))"
              : "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(168,85,247,0.2), rgba(255,255,255,0.4))",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          pointerEvents: "none",
        },
      }}
      {...props}
    >
      {/* Glow Background */}
      <Box
        sx={{
          position: "absolute",
          top: -120,
          right: -100,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)"
              : "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* HEADER */}
      <DialogTitle
        component="div"
        sx={{
          position: "relative",
          px: { xs: 2.5, sm: 4 },
          pt: { xs: 2.5, sm: 4 },
          pb: 1.5,
        }}
      >
        {/* Accent line */}
        <Box
          sx={{
            position: "absolute",
            left: { xs: 20, sm: 32 },
            top: { xs: 16, sm: 24 },
            width: { xs: 40, sm: 56 },
            height: 4,
            borderRadius: 999,
            background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
          }}
        />

        <Box
          sx={{
            mt: { xs: 1, sm: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {/* Icon container */}
            <Box
              sx={{
                width: { xs: 44, sm: 52 },
                height: { xs: 44, sm: 52 },
                borderRadius: { xs: "14px", sm: "18px" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                boxShadow: "0 10px 24px rgba(99,102,241,0.35)",
                flexShrink: 0,
              }}
            >
              {headerIcon}
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.2rem", sm: "1.5rem" },
                }}
              >
                {title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: "text.secondary",
                  fontWeight: 500,
                  fontSize: { xs: "0.775rem", sm: "0.875rem" },
                }}
              >
                Please check the information before confirming
              </Typography>
            </Box>
          </Box>

          {/* Floating close button */}
          <IconButton
            onClick={handleCloseDialog}
            disabled={isSubmitting}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: "14px",
              background: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              transition: "all .2s ease",
              flexShrink: 0,

              "&:hover": {
                background: "rgba(239,68,68,0.12)",
                color: "#ef4444",
                transform: "rotate(90deg) scale(1.05)",
              },
            }}
          >
            {cancelIcon}
          </IconButton>
        </Box>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
        }}
      >
        {children}
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 4 },
          pb: { xs: 2.5, sm: 4 },
          pt: { xs: 1.5, sm: 2 },
          gap: 1.5,
          flexDirection: { xs: "column-reverse", sm: "row" },
        }}
      >
        <Button
          onClick={handleCloseDialog}
          disabled={isSubmitting}
          variant="outlined"
          sx={{
            width: { xs: "100%", sm: "auto" },
            minWidth: { xs: "100%", sm: 110 },
            borderRadius: "14px",
            px: 2.5,
            py: { xs: 1, sm: 1.2 },
            borderColor: "divider",
            color: "text.secondary",
            fontWeight: 700,
            textTransform: "none",
            transition: "all .2s ease",

            "&:hover": {
              borderColor: "text.primary",
              background: "action.hover",
              transform: "translateY(-1px)",
            },
          }}
        >
          {cancelText}
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || isSubmitDisabled}
          startIcon={
            isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              submitIcon
            )
          }
          sx={{
            width: { xs: "100%", sm: "auto" },
            minWidth: { xs: "100%", sm: 150 },
            borderRadius: "14px",
            px: 3,
            py: { xs: 1, sm: 1.2 },
            fontWeight: 800,
            textTransform: "none",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 10px 24px rgba(99,102,241,0.35)",
            transition: "all .22s ease",

            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 16px 32px rgba(99,102,241,0.45)",
            },

            "&:active": {
              transform: "scale(0.98)",
            },

            "&.Mui-disabled": {
              background: "action.disabledBackground",
              color: "action.disabled",
            },
          }}
        >
          {isSubmitting ? "Processing..." : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
