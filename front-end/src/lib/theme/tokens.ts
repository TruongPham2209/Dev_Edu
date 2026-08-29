import type { PaletteOptions } from "@mui/material";

/**
 * Centralized Light Theme Palette Tokens
 * Configured with semantic tokens and full accessibility contrast for light mode.
 */
export const lightPalette: PaletteOptions = {
  mode: "light",

  // Primary brand color used for key actions, active states, and primary buttons
  primary: {
    main: "#2563eb",
    light: "#60a5fa",
    dark: "#1d4ed8",
    contrastText: "#ffffff",
  },

  // Secondary brand color used for accents, highlights, and status tags
  secondary: {
    main: "#7c3aed",
    light: "#a78bfa",
    dark: "#6d28d9",
    contrastText: "#ffffff",
  },

  // Application background colors
  background: {
    // Default page background
    default: "#f8fafc",
    // Background color for cards, dialogs, sidebars, and elevated surfaces
    paper: "#ffffff",
  },

  // Text color hierarchy for typography readability
  text: {
    // Primary text used for headings, main titles, and body content
    primary: "#0f172a",
    // Secondary text used for descriptions, subtitles, and metadata
    secondary: "#475569",
    // Disabled text color for inactive elements
    disabled: "#94a3b8",
  },

  // Divider and subtle border lines used to separate sections
  divider: "rgba(15, 23, 42, 0.08)",

  // State Feedback Colors
  success: {
    main: "#10b981",
    light: "#34d399",
    dark: "#059669",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
    contrastText: "#ffffff",
  },
  error: {
    main: "#ef4444",
    light: "#f87171",
    dark: "#dc2626",
    contrastText: "#ffffff",
  },
  info: {
    main: "#3b82f6",
    light: "#60a5fa",
    dark: "#1d4ed8",
    contrastText: "#ffffff",
  },

  // Interactive element states
  action: {
    hover: "rgba(15, 23, 42, 0.04)",
    selected: "rgba(37, 99, 235, 0.08)",
    disabled: "rgba(15, 23, 42, 0.26)",
    disabledBackground: "rgba(15, 23, 42, 0.12)",
    focus: "rgba(37, 99, 235, 0.12)",
  },
};

/**
 * Centralized Dark Theme Palette Tokens
 * Configured with semantic tokens, deep surface backgrounds, and high-contrast text for dark mode.
 */
export const darkPalette: PaletteOptions = {
  mode: "dark",

  // Primary brand color optimized for high contrast on dark surfaces
  primary: {
    main: "#3b82f6",
    light: "#60a5fa",
    dark: "#1d4ed8",
    contrastText: "#ffffff",
  },

  // Secondary brand color optimized for dark backgrounds
  secondary: {
    main: "#8b5cf6",
    light: "#a78bfa",
    dark: "#6d28d9",
    contrastText: "#ffffff",
  },

  // Application background colors for dark mode
  background: {
    // Rich dark page background
    default: "#0b0f17",
    // Background color for cards, dialogs, drawers, and elevated surfaces
    paper: "#1e293b",
  },

  // Text color hierarchy for dark mode typography readability
  text: {
    // High contrast primary text for titles, body, and headings in dark mode
    primary: "#f8fafc",
    // Muted secondary text for subtitles, descriptions, and metadata
    secondary: "#94a3b8",
    // Inactive or disabled text color
    disabled: "#64748b",
  },

  // Border lines and dividers for dark mode
  divider: "rgba(255, 255, 255, 0.12)",

  // State Feedback Colors in Dark Mode
  success: {
    main: "#10b981",
    light: "#34d399",
    dark: "#059669",
    contrastText: "#ffffff",
  },
  warning: {
    main: "#f59e0b",
    light: "#fbbf24",
    dark: "#d97706",
    contrastText: "#ffffff",
  },
  error: {
    main: "#ef4444",
    light: "#f87171",
    dark: "#dc2626",
    contrastText: "#ffffff",
  },
  info: {
    main: "#3b82f6",
    light: "#60a5fa",
    dark: "#1d4ed8",
    contrastText: "#ffffff",
  },

  // Interactive element states in Dark Mode
  action: {
    hover: "rgba(255, 255, 255, 0.08)",
    selected: "rgba(59, 130, 246, 0.16)",
    disabled: "rgba(255, 255, 255, 0.3)",
    disabledBackground: "rgba(255, 255, 255, 0.12)",
    focus: "rgba(59, 130, 246, 0.2)",
  },
};
