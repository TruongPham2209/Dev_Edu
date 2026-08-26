import type { Components, Theme } from "@mui/material";
import { darkPalette, lightPalette } from "./tokens";
import type { ThemeMode } from "./types";

/**
 * Creates theme-level component overrides for MUI components.
 * Ensures buttons, papers, cards, inputs, dialogs, drawers, popovers, and menus
 * automatically adapt their styles based on mode.
 */
export function getComponentOverrides(mode: ThemeMode): Components<Omit<Theme, "components">> {
  const isDark = mode === "dark";

  return {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: isDark
            ? (darkPalette.background?.default as string)
            : (lightPalette.background?.default as string),
          color: isDark
            ? (darkPalette.text?.primary as string)
            : (lightPalette.text?.primary as string),
          transition: "background-color 0.2s ease, color 0.2s ease",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          textTransform: "none",
          fontWeight: 700,
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            boxShadow: "none",
          },
        },
        contained: {
          "&:hover": {
            backgroundColor: isDark ? "#2563eb" : "#1d4ed8",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(15, 23, 42, 0.08)",
          boxShadow: isDark
            ? "0 4px 20px rgba(0, 0, 0, 0.4)"
            : "0 4px 20px rgba(15, 23, 42, 0.04)",
          transition:
            "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(15, 23, 42, 0.08)",
          borderRadius: 16,
          boxShadow: isDark
            ? "0 4px 20px rgba(0, 0, 0, 0.3)"
            : "0 4px 20px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: isDark ? "#0f172a" : "#ffffff",
          color: isDark ? "#f8fafc" : "#0f172a",
          borderBottom: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.08)"
          }`,
          boxShadow: isDark
            ? "0 2px 10px rgba(0, 0, 0, 0.3)"
            : "0 2px 10px rgba(15, 23, 42, 0.03)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          borderRadius: 20,
          borderColor: isDark
            ? "rgba(255, 255, 255, 0.12)"
            : "rgba(15, 23, 42, 0.08)",
          boxShadow: isDark
            ? "0 20px 40px rgba(0, 0, 0, 0.6)"
            : "0 20px 40px rgba(15, 23, 42, 0.12)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          border: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.08)"
          }`,
          boxShadow: isDark
            ? "0 12px 28px rgba(0, 0, 0, 0.5)"
            : "0 12px 28px rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: isDark ? "#f8fafc" : "#0f172a",
          "&:hover": {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.08)"
              : "rgba(15, 23, 42, 0.04)",
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          border: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.08)"
          }`,
          boxShadow: isDark
            ? "0 16px 40px rgba(0, 0, 0, 0.5)"
            : "0 16px 40px rgba(15, 23, 42, 0.14)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: isDark ? "#1e293b" : "#ffffff",
          color: isDark ? "#f8fafc" : "#0f172a",
          borderRight: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.08)"
          }`,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${
            isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.08)"
          }`,
          color: isDark ? "#f8fafc" : "#0f172a",
        },
        head: {
          fontWeight: 700,
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.04)" : "#f8fafc",
          color: isDark ? "#f8fafc" : "#0f172a",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.03)" : "#ffffff",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.12)"
              : "rgba(15, 23, 42, 0.08)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: isDark
              ? "rgba(255, 255, 255, 0.25)"
              : "rgba(15, 23, 42, 0.2)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: isDark ? "#3b82f6" : "#2563eb",
          },
        },
        input: {
          color: isDark ? "#f8fafc" : "#0f172a",
          "&::placeholder": {
            color: isDark ? "#94a3b8" : "#475569",
            opacity: 0.7,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: isDark ? "#334155" : "#0f172a",
          color: "#ffffff",
          fontSize: "0.75rem",
          fontWeight: 500,
        },
      },
    },
  };
}
