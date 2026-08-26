import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";
import { StudentHeader } from "@/components/layout/components/student-header";

type StudentLayoutProps = {
  children: ReactNode;
};

export function StudentLayout({ children }: Readonly<StudentLayoutProps>) {
  return (
    <Box
      sx={{
        minHeight: { xs: "100dvh", md: "100vh" },
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        color: "text.primary",
        transition: "background-color 0.2s ease, color 0.2s ease",
      }}
    >
      <StudentHeader />
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
            px: { xs: 1.5, sm: 3, md: 4, lg: 6 },
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}
