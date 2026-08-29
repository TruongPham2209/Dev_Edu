"use client";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Code2,
  Terminal,
  Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const benefits = [
    {
      icon: <BookOpen size={20} color="#16a34a" />,
      title: "Structured Paths",
      desc: "Go from core fundamentals to advanced system design with expert-led paths.",
    },
    {
      icon: <Terminal size={20} color="#2563eb" />,
      title: "Practical Projects",
      desc: "Write real code, complete assignments, and receive automated test feedback.",
    },
    {
      icon: <Users size={20} color="#7c3aed" />,
      title: "Developer Network",
      desc: "Collaborate on forum discussions, ask questions, and share developer insights.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: { xs: "100dvh", lg: "100vh" },
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" },
        bgcolor: "background.default",
      }}
    >
      {/* Left Column: Platform Hero & Benefits */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          px: { lg: 8, xl: 10 },
          py: 8,
          position: "relative",
          overflow: "hidden",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? `
                radial-gradient(circle at 10% 20%, rgba(22, 163, 74, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.12) 0%, transparent 50%),
                linear-gradient(135deg, #0b0f17 0%, #0f172a 60%, #0b0f17 100%)
              `
              : `
                radial-gradient(circle at 10% 20%, rgba(22, 163, 74, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(37, 99, 235, 0.06) 0%, transparent 50%),
                linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 60%, #f0fdf4 100%)
              `,
          borderRight: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Decorative Grid Mesh */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: (theme) =>
              `radial-gradient(${theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.08)"} 1.5px, transparent 1.5px)`,
            backgroundSize: "24px 24px",
            opacity: 0.5,
            zIndex: 0,
          }}
        />

        {/* Branding */}
        <Stack
          direction="row"
          spacing={1.5}
          component={Link}
          href="/home"
          sx={{
            textDecoration: "none",
            zIndex: 1,
            alignSelf: "flex-start",
            transition: "transform 0.2s ease",
            "&:hover": { transform: "translateY(-1px)" },
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#16a34a",
              color: "#ffffff",
              width: 40,
              height: 40,
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
            }}
          >
            <Code2 size={22} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "text.primary",
              letterSpacing: "-0.03em",
            }}
          >
            DevEdu
          </Typography>
        </Stack>

        {/* Hero Copy */}
        <Box sx={{ zIndex: 1, my: "auto", maxWidth: 580 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: (theme) =>
                theme.palette.mode === "dark" ? "#4ade80" : "#166534",
              lineHeight: 1.15,
              mb: 2,
              letterSpacing: "-0.04em",
            }}
          >
            Learn, Code, and Ship software.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: (theme) =>
                theme.palette.mode === "dark" ? "#86efac" : "#15803d",
              fontSize: "1.1rem",
              lineHeight: 1.6,
              mb: 6,
              fontWeight: 500,
            }}
          >
            Become a professional programmer through practical courses and real
            projects with the DevEdu community.
          </Typography>

          {/* Benefits Stack */}
          <Stack spacing={3.5} sx={{ mb: 6 }}>
            {benefits.map((benefit, index) => (
              <Stack
                key={benefit.title}
                direction="row"
                spacing={2.5}
                sx={{
                  "@keyframes slideIn": {
                    "0%": { opacity: 0, transform: "translateX(-20px)" },
                    "100%": { opacity: 1, transform: "translateX(0)" },
                  },
                  animation: `slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s both`,
                  alignItems: "flex-start",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 42,
                    height: 42,
                    borderRadius: "12px",
                    bgcolor: "background.paper",
                    boxShadow: (theme) =>
                      theme.palette.mode === "dark"
                        ? "0 4px 14px rgba(0, 0, 0, 0.3)"
                        : "0 4px 14px rgba(15, 23, 42, 0.04)",
                    border: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                  }}
                >
                  {benefit.icon}
                </Box>
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 750, color: "text.primary", mb: 0.5 }}
                  >
                    {benefit.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "text.secondary", lineHeight: 1.5 }}
                  >
                    {benefit.desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>

          {/* IDE Widget */}
          <Box
            sx={{
              bgcolor: "#0f172a",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 24px 48px rgba(15, 23, 42, 0.24)",
              overflow: "hidden",
              fontFamily: "var(--font-geist-mono), monospace",
              width: "100%",
              maxWidth: 500,
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0)" },
                "50%": { transform: "translateY(-6px)" },
              },
              animation: "float 6s ease-in-out infinite",
            }}
          >
            {/* Header bar */}
            <Box
              sx={{
                bgcolor: "#1e293b",
                px: 2,
                py: 1.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <Stack direction="row" spacing={1}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#ef4444",
                  }}
                />
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#eab308",
                  }}
                />
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: "#22c55e",
                  }}
                />
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: "#94a3b8", fontSize: 11, fontWeight: 600 }}
              >
                devedu-profile.ts
              </Typography>
              <Box sx={{ width: 30 }} />
            </Box>

            {/* Code Content */}
            <Box
              sx={{ p: 2.5, color: "#cbd5e1", fontSize: 13, lineHeight: 1.7 }}
            >
              <Typography component="div" sx={{ color: "#38bdf8", mb: 0.5 }}>
                <span style={{ color: "#f43f5e" }}>const</span> devedu{" "}
                <span style={{ color: "#f43f5e" }}>=</span>{" "}
                <span style={{ color: "#a855f7" }}>new</span>{" "}
                <span style={{ color: "#f59e0b" }}>DevEduWorkspace</span>();
              </Typography>
              <Typography component="div" sx={{ color: "#38bdf8", mb: 0.5 }}>
                await devedu.<span style={{ color: "#60a5fa" }}>enroll</span>(
                {"{ "}
                <span style={{ color: "#fb7185" }}>course</span>:{" "}
                <span style={{ color: "#34d399" }}>
                  &quot;Full-Stack Engineering&quot;
                </span>
                {" }"});
              </Typography>
              <Typography component="div" sx={{ color: "#38bdf8", mb: 0.5 }}>
                await devedu.
                <span style={{ color: "#60a5fa" }}>buildSkills</span>();
              </Typography>

              <Box
                sx={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  mt: 2,
                  pt: 2,
                }}
              >
                <Typography
                  component="div"
                  sx={{
                    color: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    fontWeight: 600,
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>$</span> npm run
                  test:progress
                </Typography>
                <Typography component="div" sx={{ color: "#e2e8f0", mt: 0.5 }}>
                  ✔ 8 courses completed successfully
                </Typography>
                <Typography
                  component="div"
                  sx={{
                    color: "#22c55e",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  ✔ Status: Ready to build and ship code!
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: "#22c55e",
                      ml: 0.5,
                      "@keyframes pulse": {
                        "0%, 100%": { opacity: 0.2 },
                        "50%": { opacity: 1 },
                      },
                      animation: "pulse 1.5s infinite",
                    }}
                  />
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Footer indicators */}
        <Stack
          direction="row"
          spacing={4}
          sx={{
            zIndex: 1,
            color: "text.secondary",
            borderTop: "1px solid",
            borderColor: "divider",
            pt: 3,
            alignSelf: "stretch",
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <CheckCircle2 size={16} color="#16a34a" />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              SOC2 Certified
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Award size={16} color="#16a34a" />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Verified Curriculum
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Right Column: Interaction Card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, md: 6 },
          py: { xs: 3, sm: 5, lg: 8 },
        }}
      >
        {/* Mobile Header Logo (visible only on small screens < lg) */}
        <Box
          sx={{
            display: { xs: "flex", lg: "none" },
            alignItems: "center",
            justifyContent: "center",
            mb: { xs: 3, sm: 4 },
            width: "100%",
            maxWidth: 480,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            component={Link}
            href="/home"
            sx={{
              textDecoration: "none",
              alignItems: "center",
              transition: "transform 0.2s ease",
              "&:hover": { transform: "translateY(-1px)" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#16a34a",
                color: "#ffffff",
                width: 36,
                height: 36,
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)",
              }}
            >
              <Code2 size={20} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                letterSpacing: "-0.03em",
              }}
            >
              DevEdu
            </Typography>
          </Stack>
        </Box>

        <Card
          sx={{
            maxWidth: 480,
            width: "100%",
            borderRadius: { xs: "18px", sm: "24px" },
            border: "1px solid",
            borderColor: "divider",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 24px 64px rgba(0, 0, 0, 0.5), 0 4px 16px rgba(0, 0, 0, 0.3)"
                : "0 24px 64px rgba(15, 23, 42, 0.06), 0 4px 16px rgba(15, 23, 42, 0.02)",
            backgroundColor: "background.paper",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Subtle accent color top bar */}
          <Box
            sx={{
              height: 5,
              background: "linear-gradient(90deg, #16a34a 0%, #2563eb 100%)",
            }}
          />

          <CardContent sx={{ p: { xs: 2.5, sm: 4, md: 4.5 } }}>
            {/* Header info */}
            <Box sx={{ mb: { xs: 3, sm: 4 } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 850,
                  mb: 1.2,
                  letterSpacing: "-0.03em",
                  color: "text.primary",
                  fontSize: { xs: "1.5rem", sm: "1.875rem", md: "2.125rem" },
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.5,
                  fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                }}
              >
                {subtitle}
              </Typography>
            </Box>

            {children}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
