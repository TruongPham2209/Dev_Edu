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
import {
  Bell,
  Code2,
  Home,
  Menu,
  Moon,
  X,
  UserCheck,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserMenu } from "./user-menu";
import { useAuth } from "@/lib/use-auth";

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
  const pathname = usePathname();
  const { roles } = useAuth();
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
                p: { xs: 1, sm: "4px 16px" },
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  borderColor: "#0f172a",
                  bgcolor: "rgba(15, 23, 42, 0.04)",
                },
              }}
            >
              <Home size={16} />
              <Box
                component="span"
                sx={{
                  display: { xs: "none", sm: "block" },
                  ml: 1,
                }}
              >
                Switch to Student Site
              </Box>
            </Button>

            {/* Switch to Lecturer Portal (if on Admin site and user has LECTURER role) */}
            {pathname.startsWith("/admin") && roles.includes("LECTURER") && (
              <Button
                component={Link}
                href="/lecturer"
                variant="outlined"
                size="small"
                startIcon={<UserCheck size={16} />}
                sx={{
                  borderRadius: 999,
                  borderColor: "rgba(245, 158, 11, 0.4)",
                  color: "#f59e0b",
                  fontWeight: 700,
                  px: 2,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#f59e0b",
                    bgcolor: "rgba(245, 158, 11, 0.04)",
                  },
                  display: { xs: "none", md: "inline-flex" },
                }}
              >
                Switch to Lecturer Portal
              </Button>
            )}

            {/* Switch to Admin Portal (if on Lecturer site and user has ADMIN role) */}
            {pathname.startsWith("/lecturer") && roles.includes("ADMIN") && (
              <Button
                component={Link}
                href="/admin"
                variant="outlined"
                size="small"
                startIcon={<Shield size={16} />}
                sx={{
                  borderRadius: 999,
                  borderColor: "rgba(239, 68, 68, 0.4)",
                  color: "#ef4444",
                  fontWeight: 700,
                  px: 2,
                  textTransform: "none",
                  "&:hover": {
                    borderColor: "#ef4444",
                    bgcolor: "rgba(239, 68, 68, 0.04)",
                  },
                  display: { xs: "none", md: "inline-flex" },
                }}
              >
                Switch to Admin Portal
              </Button>
            )}
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
