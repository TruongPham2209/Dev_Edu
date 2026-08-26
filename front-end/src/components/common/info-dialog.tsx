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
import { X } from "lucide-react";
import React from "react";

export interface InfoDialogProps extends Omit<DialogProps, "title"> {
  open: boolean;
  onClose: () => void;
  title: string | React.ReactNode;
  headerIcon: React.ReactNode;
  closeIcon?: React.ReactNode;
  closeText?: string;
  paperSx?: object;
}

export function InfoDialog({
  open,
  onClose,
  title,
  headerIcon,
  closeIcon = <X size={18} />,
  closeText = "Close",
  maxWidth = "md",
  children,
  paperSx,
  ...props
}: InfoDialogProps) {
  const handleCloseDialog = () => {
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
        "& .MuiDialog-paper": {
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          border: "1px solid",
          borderColor: "divider",

          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(180deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))"
              : "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.98))",

          backdropFilter: "blur(18px)",

          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 10px 30px rgba(0, 0, 0, 0.5)"
              : "0 10px 30px rgba(15,23,42,0.08)",
          ...paperSx,
        },
      }}
      {...props}
    >
      {/* Glow Background */}
      {/* <Box
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
      /> */}

      {/* HEADER */}
      <DialogTitle
        component="div"
        sx={{
          position: "relative",
          px: { xs: 2.5, sm: 4 },
          pt: { xs: 2.5, sm: 4 },
          pb: { xs: 1.5, sm: 2 },
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
            background: "rgba(59,130,246,0.7)",
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
              gap: { xs: 1.25, sm: 2 },
            }}
          >
            {/* Icon container */}
            <Box
              sx={{
                width: { xs: 42, sm: 52 },
                height: { xs: 42, sm: 52 },
                borderRadius: { xs: "14px", sm: "18px" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(15, 23, 42, 0.05)",
                color: "text.primary",
                border: "1px solid",
                borderColor: "divider",
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
                  fontWeight: 700,
                  color: "text.primary",
                  lineHeight: 1.2,
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "1.15rem", sm: "1.5rem" },
                }}
              >
                {title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.25,
                  color: "text.secondary",
                  fontWeight: 500,
                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                }}
              >
                Review the details below
              </Typography>
            </Box>
          </Box>

          {/* Floating close button */}
          <IconButton
            onClick={handleCloseDialog}
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
                background: "action.selected",
              },
            }}
          >
            {closeIcon}
          </IconButton>
        </Box>
      </DialogTitle>

      {/* CONTENT */}
      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 4 },
          py: { xs: 1.5, sm: 3 },
          display: "block",
          flex: 1,
          overflowY: "auto",
        }}
      >
        {children}
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 4 },
          pb: { xs: 2.5, sm: 4 },
          pt: { xs: 1, sm: 2 },
          gap: 1.5,
        }}
      >
        <Button
          onClick={handleCloseDialog}
          variant="outlined"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            borderColor: "divider",
            color: "text.primary",
            background: "background.paper",
            "&:hover": {
              borderColor: "divider",
              background: "action.hover",
            },
          }}
        >
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
