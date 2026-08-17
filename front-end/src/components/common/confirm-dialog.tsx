import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { ReactNode } from "react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmColor = "error",
  isLoading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?:
    | "primary"
    | "secondary"
    | "error"
    | "warning"
    | "info"
    | "success";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onCancel}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: { xs: 3, sm: 2.5 },
            m: { xs: 2, sm: 3 },
            width: { xs: "calc(100% - 32px)", sm: "auto" },
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          fontSize: { xs: "1.05rem", sm: "1.2rem" },
          px: { xs: 2.5, sm: 3 },
          pt: { xs: 2.5, sm: 3 },
          pb: 1,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2.5, sm: 3 }, py: 1 }}>
        {description &&
          (typeof description === "string" ? (
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.85rem", sm: "0.875rem" },
              }}
            >
              {description}
            </Typography>
          ) : (
            description
          ))}
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3 },
          pb: { xs: 2.5, sm: 3 },
          pt: 1.5,
          flexDirection: { xs: "column-reverse", sm: "row" },
          gap: { xs: 1, sm: 1.5 },
          "& > button": {
            width: { xs: "100%", sm: "auto" },
            m: "0 !important",
          },
        }}
      >
        <Button
          onClick={onCancel}
          disabled={isLoading}
          variant="outlined"
          color="inherit"
          sx={{ borderRadius: 2, fontWeight: 600, py: 0.8 }}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          disabled={isLoading}
          startIcon={
            isLoading ? <CircularProgress size={16} color="inherit" /> : null
          }
          sx={{ fontWeight: 700, borderRadius: 2, py: 0.8 }}
        >
          {isLoading ? "Processing..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
