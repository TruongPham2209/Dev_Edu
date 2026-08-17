"use client";

import type { AutosaveState } from "@/hooks/use-quiz-exam-session";
import { Chip } from "@mui/material";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface ExamAutosaveIndicatorProps {
  state: AutosaveState;
}

export function ExamAutosaveIndicator({ state }: ExamAutosaveIndicatorProps) {
  if (state === "SAVING") {
    return (
      <Chip
        icon={<Loader2 size={13} className="animate-spin" />}
        label="Saving..."
        color="info"
        variant="outlined"
        size="small"
        sx={{
          fontWeight: 600,
          borderRadius: 9999,
          height: { xs: 26, sm: 28 },
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      />
    );
  }

  if (state === "ERROR") {
    return (
      <Chip
        icon={<AlertCircle size={13} />}
        label="Error saving"
        color="error"
        variant="outlined"
        size="small"
        sx={{
          fontWeight: 600,
          borderRadius: 9999,
          height: { xs: 26, sm: 28 },
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <Chip
      icon={<CheckCircle2 size={13} />}
      label="Auto-saved"
      color="success"
      variant="outlined"
      size="small"
      sx={{
        fontWeight: 600,
        borderRadius: 9999,
        height: { xs: 26, sm: 28 },
        fontSize: { xs: "0.7rem", sm: "0.75rem" },
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    />
  );
}
