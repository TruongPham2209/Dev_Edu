"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface SessionLockDialogProps {
  open: boolean;
  message?: string;
}

export function SessionLockDialog({ open, message }: SessionLockDialogProps) {
  const router = useRouter();

  const handleReturnHome = () => {
    router.push("/home");
  };

  return (
    <Dialog
      open={open}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: "blur(8px)",
            backgroundColor: "rgba(15,23,42,0.8)",
          },
        },
        paper: {
          sx: {
            borderRadius: 3,
            textAlign: "center",
            p: 2,
          },
        },
      }}
    >
      <DialogTitle sx={{ pt: 2, pb: 1 }}>
        <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: 8 }} />
        <Typography variant="h6" sx={{ fontWeight: 700, color: "error.main" }}>
          Session Conflict!
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ py: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {message ||
            "The system detected that this exam is being opened in another tab or device. To ensure fairness, the current exam session has been temporarily locked."}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "center", pt: 2 }}>
        <Button
          variant="contained"
          color="error"
          onClick={handleReturnHome}
          sx={{ borderRadius: 2, px: 3 }}
        >
          Back to Home
        </Button>
      </DialogActions>
    </Dialog>
  );
}
