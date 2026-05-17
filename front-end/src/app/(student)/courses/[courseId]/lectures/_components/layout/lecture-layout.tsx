"use client";

import { Box, Container, Grid } from "@mui/material";
import { ReactNode } from "react";

interface LectureLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function LectureLayout({ children, sidebar }: LectureLayoutProps) {
  return (
    <Container maxWidth="xl" sx={{ py: 4, scrollbarGutter: "stable" }}>
      <Grid container spacing={4}>
        {/* Main Content Area */}
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {children}
          </Box>
        </Grid>

        {/* Sidebar Area */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Box
            sx={{
              position: { lg: "sticky" },
              top: { lg: 100 },
              maxHeight: { lg: "calc(100vh - 120px)" },
              overflowY: { lg: "auto" },
              // Custom scrollbar for premium feel
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0,0,0,0.2)",
              },
            }}
          >
            {sidebar}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
