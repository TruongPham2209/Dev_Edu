"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ConfigProvider, theme as antdTheme } from "antd";
import type { ReactNode } from "react";
import { ToastProvider } from "@/lib/toast-context";

const muiTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#7c3aed",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
    success: {
      main: "#10b981",
    },
    warning: {
      main: "#f59e0b",
    },
    error: {
      main: "#ef4444",
    },
  },
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
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          textTransform: "none",
          fontWeight: 700,
          boxShadow: "none",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.04)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

const antdConfig = {
  algorithm: antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: "#2563eb",
    colorInfo: "#2563eb",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorTextBase: "#0f172a",
    colorBgBase: "#f8fafc",
    colorBorder: "rgba(15, 23, 42, 0.08)",
    borderRadius: 16,
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  },
};

export function AppProviders({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <ToastProvider>
      <ConfigProvider theme={antdConfig}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ConfigProvider>
    </ToastProvider>
  );
}
