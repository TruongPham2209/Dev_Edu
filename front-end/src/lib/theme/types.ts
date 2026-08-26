export type ThemeMode = "light" | "dark";

export const THEME_MODE_KEY = "dev_edu_theme_mode";

export interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}
