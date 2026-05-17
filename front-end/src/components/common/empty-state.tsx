import { Box, Button, Typography } from "@mui/material";
import { Inbox, PlusCircle } from "lucide-react";

export function EmptyState({
  title,
  subtitle,
  icon,
  actionLabel,
  onAction,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Box
      sx={{
        textAlign: "center",
        py: 6,
        color: "text.secondary",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: "50%",
            bgcolor: "rgba(37, 99, 235, 0.08)",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon || <Inbox size={24} />}
        </Box>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {subtitle}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="contained"
          startIcon={<PlusCircle size={18} />}
          sx={{ mt: 2, borderRadius: 999 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
