"use client";

import { Box, Typography } from "@mui/material";
import { GraduationCap } from "lucide-react";
import { EnrollmentList } from "./enrollment-list";

export default function MyCoursesPage() {
  return (
    <Box
      sx={{
        maxWidth: 1440,
        mx: "auto",
        px: { xs: 1.5, sm: 3, lg: 4 },
        py: { xs: 2.5, sm: 4, md: 5 },
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: { xs: 1.25, sm: 2 },
          mb: { xs: 3, sm: 4 },
        }}
      >
        <Box
          sx={{
            p: { xs: 1.25, sm: 1.5 },
            bgcolor: "#e0f2fe",
            borderRadius: 2,
            display: "flex",
            flexShrink: 0,
          }}
        >
          <GraduationCap size={24} color="#0284c7" />
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#0f172a",
            fontSize: { xs: "1.35rem", sm: "1.75rem", md: "2.1rem" },
            lineHeight: 1.3,
          }}
        >
          Your learning space
        </Typography>
      </Box>

      <Box sx={{ display: "block" }}>
        <EnrollmentList />
      </Box>
    </Box>
  );
}
