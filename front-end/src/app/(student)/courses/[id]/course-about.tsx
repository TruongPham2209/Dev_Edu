"use client";

import { Box, Typography, alpha } from "@mui/material";
import { Info } from "lucide-react";

interface CourseAboutProps {
  description?: string;
}

export const CourseAbout = ({ description }: CourseAboutProps) => {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.25, sm: 2 }, mb: { xs: 2.5, sm: 4 } }}>
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            bgcolor: (theme) =>
              alpha(
                theme.palette.success.main,
                theme.palette.mode === "dark" ? 0.18 : 0.1,
              ),
            borderRadius: 3,
            color: "success.main",
            display: "flex",
            flexShrink: 0,
          }}
        >
          <Info size={24} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", fontSize: { xs: "1.2rem", sm: "1.5rem" } }}>
            About this course
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.5, fontSize: { xs: "0.85rem", sm: "0.95rem" } }}>
            Everything you need to know about this course
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          color: "text.secondary",
          lineHeight: 1.8,
          fontSize: { xs: "0.9rem", sm: "1rem" },
          "& h1, & h2, & h3": {
            color: "text.primary",
            fontWeight: 800,
            mt: 3,
            mb: 1.5,
          },
          "& p": { mb: 2 },
          "& ul": { pl: 3, mb: 2 },
          "& li": { mb: 1 },
        }}
        dangerouslySetInnerHTML={{
          __html: description || "",
        }}
      />
    </Box>
  );
};
