import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";

const STATUS_META: Record<
  string,
  { label: string; color: string; background: string }
> = {
  ACTIVE: {
    label: "Active",
    color: "#0f766e",
    background: alpha("#14b8a6", 0.16),
  },
  DELETED: {
    label: "Deleted",
    color: "#b42318",
    background: alpha("#ef4444", 0.16),
  },
  PENDING: {
    label: "Pending",
    color: "#b45309",
    background: alpha("#f59e0b", 0.18),
  },
  APPROVED: {
    label: "Approved",
    color: "#0f766e",
    background: alpha("#14b8a6", 0.16),
  },
  REJECTED: {
    label: "Rejected",
    color: "#b42318",
    background: alpha("#ef4444", 0.16),
  },
  SUPERSEDED: {
    label: "Superseded",
    color: "#475569",
    background: alpha("#94a3b8", 0.2),
  },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || {
    label: status,
    color: "#1f2937",
    background: alpha("#cbd5f5", 0.2),
  };

  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{
        bgcolor: meta.background,
        color: meta.color,
        fontWeight: 600,
        borderRadius: 999,
      }}
    />
  );
}
