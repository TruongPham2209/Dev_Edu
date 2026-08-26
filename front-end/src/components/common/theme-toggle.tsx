"use client";

import { useThemeMode } from "@/lib/theme";
import { IconButton, Tooltip } from "@mui/material";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

interface ThemeToggleProps {
  size?: "small" | "medium" | "large";
}

const emptySubscribe = () => () => {};

/**
 * Reusable Theme Toggle button component.
 * Allows users to switch between Light and Dark themes seamlessly.
 */
export function ThemeToggle({ size = "medium" }: ThemeToggleProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const { mode, toggleTheme } = useThemeMode();

  const isDark = mounted && mode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        aria-label="Toggle theme mode"
        size={size}
        sx={{
          transition: "transform 0.2s ease-in-out, color 0.2s ease-in-out",
          "&:hover": {
            transform: "rotate(15deg)",
          },
        }}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-amber-400 transition-all" />
        ) : (
          <Moon className="h-5 w-5 text-slate-600 transition-all" />
        )}
      </IconButton>
    </Tooltip>
  );
}
