"use client";

import { Alert, Box, Stack, Typography } from "@mui/material";
import { AlertTriangle, Clock } from "lucide-react";

interface ExamTimerProps {
  timeRemainingSeconds: number;
}

export function ExamTimer({ timeRemainingSeconds = 0 }: ExamTimerProps) {
  const safeSeconds =
    isNaN(timeRemainingSeconds) || timeRemainingSeconds < 0
      ? 0
      : Math.floor(timeRemainingSeconds);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0",
        )}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0",
        )}`;

  const isCritical = safeSeconds <= 60 && safeSeconds > 0;
  const isWarning = safeSeconds <= 300 && safeSeconds > 60;

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 0.75,
          borderRadius: 3,
          bgcolor: isCritical
            ? "error.main"
            : isWarning
              ? "error.50"
              : "action.hover",
          border: 1,
          borderColor: isCritical
            ? "error.dark"
            : isWarning
              ? "error.main"
              : "divider",
          color: isCritical
            ? "error.contrastText"
            : isWarning
              ? "error.main"
              : "text.primary",
          animation: isCritical
            ? "urgentPulse 1s infinite"
            : isWarning
              ? "pulse 1.5s infinite"
              : "none",
          "@keyframes urgentPulse": {
            "0%": { opacity: 1 },
            "50%": { opacity: 0.85 },
            "100%": { opacity: 1 },
          },
          "@keyframes pulse": {
            "0%": { opacity: 1 },
            "50%": { opacity: 0.7 },
            "100%": { opacity: 1 },
          },
        }}
      >
        <Clock size={20} />
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 800, fontFamily: "monospace" }}
        >
          {formattedTime}
        </Typography>
      </Box>

      {isCritical && (
        <Alert
          severity="error"
          variant="filled"
          icon={<AlertTriangle size={18} />}
          sx={{
            borderRadius: 2,
            py: 0.5,
            px: 1.5,
            fontSize: "0.825rem",
            fontWeight: 700,
            alignItems: "center",
          }}
        >
          Less than 1 minute left! Submit your test now.
        </Alert>
      )}
    </Stack>
  );
}
