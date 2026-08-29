import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { AppProviders } from "@/components/providers/app-providers";
import { AuthSync } from "@/components/auth/auth-sync";
import { ChatWidget } from "@/components/chat/chat-widget";
import { cookies } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DevEdu",
    template: "%s | DevEdu",
  },
  description: "A platform for learning and sharing knowledge",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? null;
  const themeCookie = cookieStore.get("dev_edu_theme_mode")?.value as
    | "light"
    | "dark"
    | undefined;
  const initialTheme = themeCookie === "dark" ? "dark" : "light";

  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen" suppressHydrationWarning>
        <script
          id="theme-init-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem("dev_edu_theme_mode") || ${JSON.stringify(initialTheme)};
                  document.documentElement.setAttribute("data-theme", mode);
                  if (mode === "dark") {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                  document.cookie = "dev_edu_theme_mode=" + mode + "; path=/; max-age=31536000; SameSite=Lax";
                } catch (e) {
                  console.error("Theme init script error:", e);
                }
              })();
            `
          }}
        />
        <script
          id="auth-init-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var token = ${JSON.stringify(token)};
                  if (token) {
                    if (localStorage.getItem("auth_token") !== token) {
                      localStorage.setItem("auth_token", token);
                    }
                  } else {
                    if (localStorage.getItem("auth_token")) {
                      localStorage.removeItem("auth_token");
                      localStorage.removeItem("auth_user");
                    }
                  }
                } catch (e) {
                  console.error("Auth sync script error:", e);
                }
              })();
            `
          }}
        />
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AppProviders initialTheme={initialTheme}>
            {children}
            <AuthSync serverToken={token} />
            <ChatWidget />
          </AppProviders>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
