"use client";

import { ThemeModeProvider } from "@/lib/theme";
import { ToastProvider } from "@/lib/toast-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

export function AppProviders({
  children,
  initialTheme = "light",
}: Readonly<{
  children: ReactNode;
  initialTheme?: "light" | "dark";
}>) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ThemeModeProvider initialTheme={initialTheme}>
          {children}
        </ThemeModeProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
