import { Box, Button, Typography } from "@mui/material";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export function ErrorState({
  title,
  onRetry,
  actionLabel,
}: {
  title: string;
  onRetry?: () => void;
  actionLabel?: string;
}) {
  return (
    <Box sx={{ textAlign: "center", py: 6 }}>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "50%",
            bgcolor: "rgba(248, 113, 113, 0.14)",
            color: "#ef4444",
          }}
        >
          <AlertTriangle size={24} />
        </Box>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "error.main" }}>
        {title}
      </Typography>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outlined"
          startIcon={<RefreshCcw size={18} />}
          sx={{ mt: 2, borderRadius: 999 }}
        >
          {actionLabel || "Try again"}
        </Button>
      )}
    </Box>
  );
}
