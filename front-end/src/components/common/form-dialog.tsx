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
  submitText = "Xác nhận",
  cancelText = "Hủy",
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
            background:
              "radial-gradient(circle at center, rgba(15,23,42,0.35), rgba(15,23,42,0.65))",
          },
        },
      }}
      sx={{
        "& .MuiPaper-root": {
          position: "relative",
          overflow: "hidden",
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.12)",
          background: `
            linear-gradient(
              135deg,
              rgba(255,255,255,0.95),
              rgba(248,250,252,0.92)
            )
          `,
          backdropFilter: "blur(20px)",
          boxShadow: `
            0 20px 60px rgba(15,23,42,0.25),
            0 8px 24px rgba(15,23,42,0.12)
          `,
        },

        "& .MuiPaper-root::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          padding: "1px",
          borderRadius: "28px",
          background: `
            linear-gradient(
              135deg,
              rgba(99,102,241,0.5),
              rgba(168,85,247,0.2),
              rgba(255,255,255,0.4)
            )
          `,
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
          background:
            "radial-gradient(circle, rgba(99,102,241,0.18), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* HEADER */}
      <DialogTitle
        component="div"
        sx={{
          position: "relative",
          px: 4,
          pt: 4,
          pb: 2,
        }}
      >
        {/* Accent line */}
        <Box
          sx={{
            position: "absolute",
            left: 32,
            top: 24,
            width: 56,
            height: 4,
            borderRadius: 999,
            background: "linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)",
          }}
        />

        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Icon container */}
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                color: "white",
                boxShadow: "0 10px 24px rgba(99,102,241,0.35)",
              }}
            >
              {headerIcon}
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                }}
              >
                {title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                Vui lòng kiểm tra thông tin trước khi xác nhận
              </Typography>
            </Box>
          </Box>

          {/* Floating close button */}
          <IconButton
            onClick={handleCloseDialog}
            disabled={isSubmitting}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "14px",
              background: "rgba(148,163,184,0.12)",
              border: "1px solid rgba(148,163,184,0.18)",
              transition: "all .2s ease",

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
          px: 4,
          py: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {children}
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions
        sx={{
          px: 4,
          pb: 4,
          pt: 2,
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleCloseDialog}
          disabled={isSubmitting}
          variant="outlined"
          sx={{
            minWidth: 110,
            borderRadius: "14px",
            px: 2.5,
            py: 1.2,
            borderColor: "rgba(148,163,184,0.25)",
            color: "#475569",
            fontWeight: 700,
            textTransform: "none",
            transition: "all .2s ease",

            "&:hover": {
              borderColor: "rgba(148,163,184,0.45)",
              background: "rgba(148,163,184,0.08)",
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
            minWidth: 150,
            borderRadius: "14px",
            px: 3,
            py: 1.2,
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
              background: "#cbd5e1",
              color: "#64748b",
            },
          }}
        >
          {isSubmitting ? "Đang xử lý..." : submitText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
