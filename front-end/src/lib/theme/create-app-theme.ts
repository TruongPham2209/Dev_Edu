import { createTheme, type Theme } from "@mui/material";
import { theme as antdTheme, type ThemeConfig } from "antd";
import { getComponentOverrides } from "./components";
import { darkPalette, lightPalette } from "./tokens";
import type { ThemeMode } from "./types";

/**
 * Creates the MUI Theme object for a given mode ('light' | 'dark').
 */
export function createAppMuiTheme(mode: ThemeMode): Theme {
  const palette = mode === "dark" ? darkPalette : lightPalette;
  const components = getComponentOverrides(mode);

  return createTheme({
    palette,
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      h1: {
        fontWeight: 800,
        letterSpacing: "-0.04em",
      },
      h2: {
        fontWeight: 800,
        letterSpacing: "-0.035em",
      },
      h3: {
        fontWeight: 750,
        letterSpacing: "-0.03em",
      },
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
      },
      h6: {
        fontWeight: 650,
      },
    },
    components,
  });
}

/**
 * Creates the Ant Design ConfigProvider theme configuration matching MUI mode.
 */
export function createAppAntdConfig(mode: ThemeMode): ThemeConfig {
  const isDark = mode === "dark";

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDark ? "#3b82f6" : "#2563eb",
      colorInfo: isDark ? "#3b82f6" : "#2563eb",
      colorSuccess: "#10b981",
      colorWarning: "#f59e0b",
      colorError: "#ef4444",
      colorTextBase: isDark ? "#f8fafc" : "#0f172a",
      colorBgBase: isDark ? "#0b0f17" : "#f8fafc",
      colorBgContainer: isDark ? "#1e293b" : "#ffffff",
      colorBorder: isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(15, 23, 42, 0.08)",
      borderRadius: 16,
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    },
  };
}
