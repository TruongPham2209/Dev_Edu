import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ReactNode } from "react";
import { roleThemes, type RoleKey } from "@/lib/role-theme";

type RoleShellProps = {
  role: RoleKey;
  children: ReactNode;
};

export function RoleShell({ role, children }: Readonly<RoleShellProps>) {
  const theme = roleThemes[role];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: theme.background,
        color: "#0f172a",
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
      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          py: { xs: 2, md: 4 },
        }}
      >
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "flex-start", md: "center" },
              justifyContent: "space-between",
            }}
          >
            <Stack spacing={1}>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label={theme.roleLabel}
                  sx={{
                    bgcolor: alpha(theme.accent, 0.12),
                    color: theme.accent,
                    fontWeight: 700,
                    borderRadius: 999,
                  }}
                />
                <Typography
                  variant="overline"
                  sx={{
                    letterSpacing: "0.26em",
                    color: "text.secondary",
                  }}
                >
                  {theme.brand}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", maxWidth: 760 }}
              >
                {theme.description}
              </Typography>
            </Stack>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {theme.chips.map((chip) => (
                <Chip
                  key={chip}
                  label={chip}
                  variant="outlined"
                  sx={{
                    borderColor: alpha(theme.accent, 0.2),
                    bgcolor: "rgba(255, 255, 255, 0.58)",
                    color: "#0f172a",
                    fontWeight: 600,
                  }}
                />
              ))}
            </Box>
          </Stack>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              overflowX: "auto",
              pb: 1,
            }}
          >
            {theme.navItems.map((item) => (
              <Button
                key={item.label}
                href={item.href}
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  borderColor: alpha(theme.accent, 0.22),
                  color: theme.accent,
                  bgcolor: "rgba(255, 255, 255, 0.68)",
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 6,
              border: `1px solid ${alpha(theme.accent, 0.16)}`,
              backgroundColor: "rgba(255, 255, 255, 0.74)",
              backdropFilter: "blur(24px)",
              boxShadow: "0 30px 90px rgba(15, 23, 42, 0.1)",
            }}
          >
            {children}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
