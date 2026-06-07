import { Box, Button, Typography } from "@mui/material";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export function ErrorState({
  title,
  subtitle,
  iconAction = <RefreshCcw size={18} />,
  onRetry,
  actionLabel,
}: {
  title: string;
  subtitle?: string;
  iconAction?: React.ReactNode;
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
      {subtitle && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, maxWidth: 400, mx: "auto" }}
        >
          {subtitle}
        </Typography>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="outlined"
          startIcon={iconAction}
          sx={{ mt: 3, borderRadius: 999 }}
        >
          {actionLabel || "Retry"}
        </Button>
      )}
    </Box>
  );
}
