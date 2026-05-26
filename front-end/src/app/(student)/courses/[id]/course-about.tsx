"use client";

import { Box, Typography } from "@mui/material";
import { Info } from "lucide-react";

interface CourseAboutProps {
  description?: string;
}

export const CourseAbout = ({ description }: CourseAboutProps) => {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{
            p: 1.5,
            bgcolor: "#f0fdf4",
            borderRadius: 3,
            color: "#16a34a",
          }}
        >
          <Info size={28} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            About this course
          </Typography>
          <Typography sx={{ color: "#64748b", mt: 0.5 }}>
            Everything you need to know about this course
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          color: "#475569",
          lineHeight: 1.8,
          fontSize: "1rem",
          "& h1, & h2, & h3": {
            color: "#0f172a",
            fontWeight: 800,
            mt: 4,
            mb: 2,
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
