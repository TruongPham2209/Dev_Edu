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
        position: "relative",
        bgcolor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <Box sx={{ position: "relative" }}>
        <StudentHeader />
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
          <Box
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 3,
              backgroundColor: "#ffffff",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
              border: "1px solid #e2e8f0",
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
