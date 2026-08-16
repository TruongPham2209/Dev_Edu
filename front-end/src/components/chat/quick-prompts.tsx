"use client";

import React from "react";
import { Chip, Stack, Typography, alpha } from "@mui/material";
import { Sparkles, Code, DollarSign, Compass, Terminal } from "lucide-react";

export interface QuickPromptsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const PROMPT_ITEMS = [
  { text: "Recommend Backend Development courses", icon: <Code size={13} style={{ color: "#2563eb" }} /> },
  { text: "Courses under 500,000 VND", icon: <DollarSign size={13} style={{ color: "#10b981" }} /> },
  { text: "Fullstack Web Developer roadmap", icon: <Compass size={13} style={{ color: "#7c3aed" }} /> },
  { text: "Beginner Friendly Python courses", icon: <Terminal size={13} style={{ color: "#f59e0b" }} /> },
];

export function QuickPrompts({ onSelectPrompt, disabled }: QuickPromptsProps) {
  return (
    <Stack spacing={1.25} sx={{ p: 1, pb: 1.5, width: "100%" }}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", px: 0.5 }}>
        <Sparkles size={14} style={{ color: "#7c3aed" }} />
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.4px" }}>
          Suggested Prompts
        </Typography>
      </Stack>

      <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
        {PROMPT_ITEMS.map((item) => (
          <Chip
            key={item.text}
            icon={item.icon}
            label={item.text}
            onClick={() => onSelectPrompt(item.text)}
            disabled={disabled}
            size="small"
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              cursor: "pointer",
              fontSize: "0.775rem",
              fontWeight: 600,
              py: 1.75,
              px: 0.5,
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.primary.main, 0.04),
              backdropFilter: "blur(6px)",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              "& .MuiChip-icon": {
                ml: 0.5,
              },
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                borderColor: "primary.main",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 18px -2px rgba(37, 99, 235, 0.2)",
              },
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
