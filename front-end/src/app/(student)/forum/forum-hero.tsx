"use client";

import { Box, Stack, Typography, alpha } from "@mui/material";
import { MessageSquare, TrendingUp, Users } from "lucide-react";

export function ForumHero() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: { xs: 320, md: 400 },
        borderRadius: { xs: 2, md: 3 },
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(145deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(145deg, #f8fafc 0%, #e0f2fe 100%)",
        color: "text.primary",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        mb: { xs: 6, md: 8 },
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 20px 40px -15px rgba(0, 0, 0, 0.5)"
            : "0 20px 40px -15px rgba(2, 132, 199, 0.15)",
        border: "1px solid",
        borderColor: (theme) =>
          theme.palette.mode === "dark" ? "divider" : "rgba(56, 189, 248, 0.2)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "50%",
          height: "140%",
          background:
            "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <Box sx={{ p: { xs: 3, sm: 5, md: 8 }, zIndex: 1, width: "100%" }}>
        <Box sx={{ maxWidth: 700 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(15, 23, 42, 0.6)"
                  : "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(10px)",
              border: "1px solid",
              borderColor: (theme) =>
                theme.palette.mode === "dark"
                  ? "divider"
                  : "rgba(56, 189, 248, 0.3)",
              px: { xs: 2, sm: 2.5 },
              py: 0.75,
              borderRadius: 10,
              mb: { xs: 2.5, sm: 4 },
              color: "primary.main",
            }}
          >
            <MessageSquare size={16} color="currentColor" />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "primary.main",
                letterSpacing: "0.02em",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              DevEdu Community
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: "1.65rem", sm: "2.5rem", md: "3.75rem" },
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "text.primary",
            }}
          >
            A place to connect <br />
            <Box component="span" sx={{ color: "primary.main" }}>
              Passion for technology
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              mb: { xs: 3, sm: 5 },
              fontSize: { xs: "0.95rem", sm: "1.125rem", md: "1.25rem" },
              lineHeight: 1.6,
              maxWidth: 600,
            }}
          >
            Let&apos;s discuss, answer questions, and share learning experiences.
            Every question matters.
          </Typography>

          <Stack direction="row" spacing={{ xs: 2.5, sm: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              <Box
                sx={{
                  p: { xs: 1.25, sm: 1.5 },
                  bgcolor: (theme) =>
                    alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.18 : 0.08,
                    ),
                  color: "primary.main",
                  borderRadius: 3,
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 4px 10px rgba(0,0,0,0.3)"
                      : "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <Users size={20} color="currentColor" />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.2,
                    color: "text.primary",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  25k+
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  Members
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              <Box
                sx={{
                  p: { xs: 1.25, sm: 1.5 },
                  bgcolor: (theme) =>
                    alpha(
                      theme.palette.primary.main,
                      theme.palette.mode === "dark" ? 0.18 : 0.08,
                    ),
                  color: "primary.main",
                  borderRadius: 3,
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 4px 10px rgba(0,0,0,0.3)"
                      : "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <TrendingUp size={20} color="currentColor" />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    lineHeight: 1.2,
                    color: "text.primary",
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                  }}
                >
                  10k+
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  Posts
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
