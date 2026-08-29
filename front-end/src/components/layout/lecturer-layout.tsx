"use client";

import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";
import { ManageHeader } from "@/components/layout/components/manage-header";

type LecturerLayoutProps = {
  children: ReactNode;
};

export function LecturerLayout({ children }: Readonly<LecturerLayoutProps>) {
  return (
    <Box
      sx={{
        minHeight: { xs: "100dvh", lg: "100vh" },
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        color: "text.primary",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      <ManageHeader title="Lecturer workspace" />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            px: { xs: 1.5, sm: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              p: { xs: 1.5, sm: 2.5, md: 3 },
              borderRadius: { xs: 2, sm: 3 },
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              backdropFilter: "blur(14px)",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 24px 60px rgba(0, 0, 0, 0.4)"
                  : "0 24px 60px rgba(15, 23, 42, 0.08)",
              transition:
                "background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

