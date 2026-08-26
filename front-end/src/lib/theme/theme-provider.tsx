"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ConfigProvider } from "antd";
import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import { createAppAntdConfig, createAppMuiTheme } from "./create-app-theme";
import { THEME_MODE_KEY, type ThemeContextType, type ThemeMode } from "./types";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultThemeContext: ThemeContextType = {
  mode: "light",
  toggleTheme: () => {},
  setTheme: () => {},
};

/**
 * Custom hook to access theme mode and switching functions.
 * Returns active context when wrapped in ThemeModeProvider, or fallback default in isolated tests.
 */
export function useThemeMode(): ThemeContextType {
  const context = useContext(ThemeContext);
  return context ?? defaultThemeContext;
}

interface ThemeModeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
}

let themeListeners: Array<() => void> = [];

function subscribeTheme(callback: () => void) {
  themeListeners.push(callback);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", callback);
  }
  return () => {
    themeListeners = themeListeners.filter((l) => l !== callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", callback);
    }
  };
}

function emitThemeChange() {
  themeListeners.forEach((l) => l());
}

function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const saved = localStorage.getItem(THEME_MODE_KEY);
    if (saved === "dark" || saved === "light") {
      return saved;
    }
    const htmlAttr = document.documentElement.getAttribute("data-theme");
    if (htmlAttr === "dark" || htmlAttr === "light") {
      return htmlAttr;
    }
  } catch (e) {
    console.error("Failed to read theme preference from localStorage:", e);
  }

  return "light";
}

/**
 * Provider encapsulating theme state, persistence, MUI ThemeProvider, and AntD ConfigProvider.
 */
export function ThemeModeProvider({
  children,
  initialTheme = "light",
}: ThemeModeProviderProps) {
  const getServerSnapshot = useCallback(() => initialTheme, [initialTheme]);

  const mode = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerSnapshot,
  );

  // Sync html data-theme attribute & localStorage & cookie whenever mode changes
  const applyThemeMode = useCallback((newMode: ThemeMode) => {
    try {
      localStorage.setItem(THEME_MODE_KEY, newMode);
      document.cookie = `${THEME_MODE_KEY}=${newMode}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.setAttribute("data-theme", newMode);
      if (newMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch (e) {
      console.error("Failed to save theme preference:", e);
    }
    emitThemeChange();
  }, []);

  const toggleTheme = useCallback(() => {
    applyThemeMode(mode === "light" ? "dark" : "light");
  }, [applyThemeMode, mode]);

  const setTheme = useCallback(
    (newMode: ThemeMode) => {
      if (newMode !== mode) {
        applyThemeMode(newMode);
      }
    },
    [applyThemeMode, mode],
  );

  const muiTheme = useMemo(() => createAppMuiTheme(mode), [mode]);
  const antdConfig = useMemo(() => createAppAntdConfig(mode), [mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      toggleTheme,
      setTheme,
    }),
    [mode, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      <ConfigProvider theme={antdConfig}>
        <ThemeProvider theme={muiTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}
