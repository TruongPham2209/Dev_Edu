"use client";

import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserMenu } from "./user-menu";
import { Bell, Home } from "lucide-react";

export function LecturerHeader() {
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 12,
  });
  const [mounted, setMounted] = useState(false);
  const isScrolled = mounted ? scrollTrigger : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: isScrolled
          ? "rgba(255, 255, 255, 0.92)"
          : "rgba(255, 255, 255, 0.7)",
        color: "text.primary",
        borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
        backdropFilter: "blur(16px)",
      }}
      elevation={0}
    >
      <Toolbar disableGutters>
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            py: 1,
          }}
        >
          <Typography
            component={Link}
            href="/lecturer"
            variant="h6"
            sx={{
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "0.02em",
              textDecoration: "none",
            }}
          >
            SkillForge Studio
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "text.secondary", flex: 1 }}
          >
            Lecturer workspace
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              component={Link}
              href="/home"
              variant="outlined"
              size="small"
              startIcon={<Home size={18} />}
              sx={{
                borderRadius: 999,
                borderColor: "rgba(15, 23, 42, 0.12)",
                color: "#0f172a",
                fontWeight: 700,
              }}
            >
              Public Site
            </Button>
            <Tooltip title="Notifications" arrow>
              <IconButton sx={{ color: "#475569" }}>
                <Bell size={18} />
              </IconButton>
            </Tooltip>
            <UserMenu />
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
