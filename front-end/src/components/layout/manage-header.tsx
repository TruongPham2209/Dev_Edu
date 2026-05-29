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
import { Bell, Home, Code2, Moon, Menu, X } from "lucide-react";

export type ManageHeaderProps = {
  title: string;
  logoHref?: string;
  isMobile?: boolean;
  menuOpen?: boolean;
  onMenuClick?: () => void;
};

export function ManageHeader({
  title,
  logoHref = "/home",
  isMobile,
  menuOpen,
  onMenuClick,
}: ManageHeaderProps) {
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
        bgcolor: isScrolled ? "rgba(255, 255, 255, 0.95)" : "#ffffff",
        color: "text.primary",
        borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
        backdropFilter: isScrolled ? "blur(12px)" : "none",
        transition: "all 0.2s ease-in-out",
      }}
      elevation={0}
    >
      <Toolbar disableGutters>
        <Container
          maxWidth="xl"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1, sm: 2 },
            py: 1,
            height: 72,
          }}
        >
          {isMobile && onMenuClick && (
            <Button
              onClick={onMenuClick}
              sx={{ minWidth: "auto", p: 1, color: "text.primary" }}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </Button>
          )}

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#16a34a",
                color: "#ffffff",
                width: 36,
                height: 36,
                borderRadius: 2,
              }}
            >
              <Code2 size={20} />
            </Box>
            <Typography
              component={Link}
              href={logoHref}
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.02em",
                textDecoration: "none",
                display: { xs: "none", sm: "block" },
              }}
            >
              DevEdu
            </Typography>
          </Box>

          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              flex: 1,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Button
              component={Link}
              href="/home"
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 999,
                borderColor: "rgba(15, 23, 42, 0.12)",
                color: "#0f172a",
                minWidth: { xs: "auto", sm: 120 },
                p: { xs: 1, sm: "4px 16px" },
              }}
            >
              <Home size={18} />
              <Box
                component="span"
                sx={{
                  display: { xs: "none", sm: "block" },
                  ml: 1,
                  fontWeight: 700,
                }}
              >
                Public Site
              </Box>
            </Button>
            <Tooltip title="Notifications" arrow>
              <IconButton sx={{ color: "#475569" }}>
                <Bell size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Theme" arrow>
              <IconButton sx={{ color: "#475569" }}>
                <Moon size={18} />
              </IconButton>
            </Tooltip>
            <UserMenu />
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
