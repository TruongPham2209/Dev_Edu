"use client";

import { Box, Stack, Typography } from "@mui/material";
import { MessageSquare, Users, TrendingUp } from "lucide-react";

export function ForumHero() {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: { xs: 320, md: 400 },
        borderRadius: { xs: 4, md: 6 },
        background: "linear-gradient(145deg, #f8fafc 0%, #e0f2fe 100%)",
        color: "#0f172a",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        mb: { xs: 6, md: 8 },
        boxShadow: "0 20px 40px -15px rgba(2, 132, 199, 0.15)",
        border: "1px solid rgba(56, 189, 248, 0.2)",
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

      <Box sx={{ p: { xs: 4, sm: 6, md: 8 }, zIndex: 1, width: "100%" }}>
        <Box sx={{ maxWidth: 700 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "rgba(255, 255, 255, 0.6)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              px: 2.5,
              py: 1,
              borderRadius: 10,
              mb: 4,
            }}
          >
            <MessageSquare size={16} color="#0284c7" />
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "#0369a1",
                letterSpacing: "0.02em",
              }}
            >
              DevEdu Community
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              mb: 3,
              fontSize: { xs: "2.25rem", sm: "3rem", md: "3.75rem" },
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              color: "#0f172a",
            }}
          >
            A place to connect <br />
            <Box component="span" sx={{ color: "#0284c7" }}>
              Passion for technology
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#475569",
              mb: 5,
              fontSize: { xs: "1.125rem", md: "1.25rem" },
              lineHeight: 1.6,
              maxWidth: 600,
            }}
          >
            Let's discuss, answer questions, and share learning experiences.
            Every question matters.
          </Typography>

          <Stack direction="row" spacing={4}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <Users size={24} color="#0284c7" />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, lineHeight: 1.2, color: "#0f172a" }}
                >
                  25k+
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", fontWeight: 600 }}
                >
                  Members
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: "#fff",
                  borderRadius: 3,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                }}
              >
                <TrendingUp size={24} color="#0284c7" />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, lineHeight: 1.2, color: "#0f172a" }}
                >
                  10k+
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#64748b", fontWeight: 600 }}
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
