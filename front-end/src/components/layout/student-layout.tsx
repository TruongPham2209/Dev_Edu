import { Box, Container } from "@mui/material";
import type { ReactNode } from "react";
import { StudentHeader } from "@/components/layout/student-header";

type StudentLayoutProps = {
  children: ReactNode;
};

export function StudentLayout({ children }: Readonly<StudentLayoutProps>) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <StudentHeader />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          py: { xs: 2, md: 4 }, // Maintain a consistent, professional vertical spacing
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            px: { xs: 2, sm: 3, md: 4, lg: 6 }, // Proper responsive horizontal spacing
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
}
