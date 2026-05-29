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
  PaperProps,
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
        "& .MuiPaper-root": {
          position: "relative",
          overflow: "hidden",
          borderRadius: "24px",
          border: "1px solid rgba(15,23,42,0.08)",

          background: `
            linear-gradient(
              180deg,
              rgba(255,255,255,0.96),
              rgba(248,250,252,0.98)
            )
          `,

          backdropFilter: "blur(18px)",

          boxShadow: `
            0 10px 30px rgba(15,23,42,0.08),
            0 2px 8px rgba(15,23,42,0.04)
          `,
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
            background: "rgba(59,130,246,0.7)",
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
                background: "rgba(15,23,42,0.05)",
                color: "#334155",
                border: "1px solid rgba(15,23,42,0.06)",
                boxShadow: "0 10px 24px rgba(99,102,241,0.35)",
              }}
            >
              {headerIcon}
            </Box>

            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#1e293b",
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
                Review the details below
              </Typography>
            </Box>
          </Box>

          {/* Floating close button */}
          <IconButton
            onClick={handleCloseDialog}
            sx={{
              width: 40,
              height: 40,
              borderRadius: "14px",
              background: "rgba(148,163,184,0.12)",
              border: "1px solid rgba(148,163,184,0.18)",
              transition: "all .2s ease",

              // "&:hover": {
              //   background: "rgba(239,68,68,0.12)",
              //   color: "#ef4444",
              //   transform: "rotate(90deg) scale(1.05)",
              // },
              "&:hover": {
                background: "rgba(15,23,42,0.06)",
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
          variant="outlined"
          // sx={{
          //   minWidth: 110,
          //   borderRadius: "14px",
          //   px: 2.5,
          //   py: 1.2,
          //   borderColor: "rgba(148,163,184,0.25)",
          //   color: "#475569",
          //   fontWeight: 700,
          //   textTransform: "none",
          //   transition: "all .2s ease",

          //   "&:hover": {
          //     borderColor: "rgba(148,163,184,0.45)",
          //     background: "rgba(148,163,184,0.08)",
          //     transform: "translateY(-1px)",
          //   },
          // }}
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,

            borderColor: "rgba(15,23,42,0.08)",
            color: "#334155",

            background: "white",

            "&:hover": {
              borderColor: "rgba(15,23,42,0.14)",
              background: "rgba(15,23,42,0.03)",
            },
          }}
        >
          {closeText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
