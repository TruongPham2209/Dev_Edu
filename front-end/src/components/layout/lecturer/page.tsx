import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";
import { roleThemes } from "@/lib/role-theme";
import { ManageHeader } from "@/components/layout/manage-header";

type LecturerLayoutProps = {
  children: ReactNode;
};

export function LecturerLayout({ children }: Readonly<LecturerLayoutProps>) {
  const theme = roleThemes.lecturer;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "clip",
        background: theme.background,
        color: "text.primary",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: theme.glow,
          pointerEvents: "none",
        }}
      />
      <Box sx={{ position: "relative" }}>
        <ManageHeader title="Lecturer workspace" />
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
          <Box
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: "1px solid rgba(15, 23, 42, 0.08)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
