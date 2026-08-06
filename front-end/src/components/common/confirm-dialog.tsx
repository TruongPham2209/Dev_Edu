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
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        {description &&
          (typeof description === "string" ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {description}
            </Typography>
          ) : (
            description
          ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} disabled={isLoading}>
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
          sx={{ fontWeight: 600, borderRadius: 2 }}
        >
          {isLoading ? "Processing..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
