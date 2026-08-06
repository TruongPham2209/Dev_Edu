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
        px: { xs: 2, sm: 3, lg: 4 },
        py: { xs: 3, md: 5 },
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <Box
          sx={{ p: 1.5, bgcolor: "#e0f2fe", borderRadius: 2, display: "flex" }}
        >
          <GraduationCap size={28} color="#0284c7" />
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a" }}>
          Your learning space
        </Typography>
      </Box>

      <Box sx={{ display: "block" }}>
        <EnrollmentList />
      </Box>
    </Box>
  );
}
