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
        icon={<Loader2 size={16} className="animate-spin" />}
        label="Saving..."
        color="info"
        variant="outlined"
        size="small"
        sx={{ fontWeight: 600, borderRadius: 1.5 }}
      />
    );
  }

  if (state === "ERROR") {
    return (
      <Chip
        icon={<AlertCircle size={16} />}
        label="Error saving"
        color="error"
        variant="outlined"
        size="small"
        sx={{ fontWeight: 600, borderRadius: 1.5 }}
      />
    );
  }

  return (
    <Chip
      icon={<CheckCircle2 size={16} />}
      label="Auto-saved"
      color="success"
      variant="outlined"
      size="small"
      sx={{ fontWeight: 600, borderRadius: 1.5 }}
    />
  );
}
