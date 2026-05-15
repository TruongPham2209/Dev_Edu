"use client";

import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { studentNavItems } from "@/lib/navigation";
import { useAuth } from "@/lib/use-auth";
import { UserMenu } from "./user-menu";
import { Code2, ShoppingCart } from "lucide-react";

export function StudentHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
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
            justifyContent: "space-between",
            py: 1,
            height: 72,
          }}
        >
          {/* Left Section: Branding */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1 }}>
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
              href="/home"
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

          {/* Center Section: Navigation */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              justifyContent: "center",
            }}
          >
            {studentNavItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  component={Link}
                  href={item.href}
                  disableElevation
                  startIcon={<Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                  sx={{
                    borderRadius: 999,
                    fontWeight: isActive ? 700 : 600,
                    textTransform: "none",
                    fontSize: "0.95rem",
                    px: 2.5,
                    py: 1,
                    color: isActive ? "#16a34a" : "#64748b",
                    bgcolor: isActive ? "#f0fdf4" : "transparent",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: isActive ? "#dcfce7" : "#f1f5f9",
                      color: isActive ? "#15803d" : "#0f172a",
                      transform: "translateY(-1px)",
                    },
                    "& .MuiButton-startIcon": {
                      marginRight: 0.75,
                      transition: "color 0.2s ease",
                    }
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Box>

          {/* Right Section: Actions & Auth */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, justifyContent: "flex-end" }}>
            {isAuthenticated ? (
              <>
                <IconButton
                  component={Link}
                  href="/cart"
                  sx={{
                    color: "#64748b",
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
                  }}
                >
                  <ShoppingCart size={20} />
                </IconButton>
                <UserMenu />
              </>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  component={Link}
                  href="/login"
                  variant="text"
                  sx={{
                    color: "#475569",
                    fontWeight: 600,
                    px: 2,
                    "&:hover": { bgcolor: "#f1f5f9", color: "#0f172a" },
                    display: { xs: "none", sm: "flex" },
                  }}
                >
                  Đăng nhập
                </Button>
                <Button
                  component={Link}
                  href="/register"
                  variant="contained"
                  disableElevation
                  sx={{
                    borderRadius: 999,
                    fontWeight: 600,
                    bgcolor: "#16a34a",
                    px: 3,
                    py: 1,
                    "&:hover": { bgcolor: "#15803d" },
                  }}
                >
                  Đăng ký
                </Button>
              </Box>
            )}
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
