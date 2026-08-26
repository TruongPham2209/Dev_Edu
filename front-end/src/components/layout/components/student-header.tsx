"use client";

import { ThemeToggle } from "@/components/common/theme-toggle";
import { studentNavItems } from "@/lib/navigation";
import { useAuth } from "@/lib/use-auth";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useScrollTrigger,
} from "@mui/material";
import { Code2, Menu, Shield, ShoppingCart, UserCheck, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NotificationCenter } from "./notification-center";
import { UserMenu } from "./user-menu";

export function StudentHeader() {
  const pathname = usePathname() || "";
  const { isAuthenticated, roles } = useAuth();
  const scrollTrigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 12,
  });
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isScrolled = mounted ? scrollTrigger : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <AppBar
        data-testid="student-header"
        position="sticky"
        sx={{
          bgcolor: (theme) =>
            isScrolled
              ? theme.palette.mode === "dark"
                ? "rgba(15, 23, 42, 0.95)"
                : "rgba(255, 255, 255, 0.95)"
              : "background.paper",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
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
              px: { xs: 1.5, sm: 3, md: 4 },
              height: 72,
            }}
          >
            {/* Left Section: Mobile Menu Icon & Branding */}
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}
            >
              <IconButton
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle mobile menu"
                sx={{
                  display: { xs: "inline-flex", md: "none" },
                  color: "text.primary",
                  p: 1,
                }}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </IconButton>

              <Box
                component={Link}
                href="/home"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  textDecoration: "none",
                }}
              >
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
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
                  }}
                >
                  <Code2 size={20} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    color: "text.primary",
                    letterSpacing: "-0.02em",
                    textDecoration: "none",
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  DevEdu
                </Typography>
              </Box>
            </Box>

            {/* Center Section: Navigation (Desktop only) */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1.5,
                justifyContent: "center",
              }}
            >
              {studentNavItems
                .filter((item) => {
                  if (item.href === "/my-courses") {
                    return isAuthenticated && roles.includes("STUDENT");
                  }
                  return true;
                })
                .map((item) => {
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      disableElevation
                      startIcon={
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                      }
                      sx={{
                        borderRadius: 999,
                        fontWeight: isActive ? 700 : 600,
                        textTransform: "none",
                        fontSize: "0.95rem",
                        px: 2.5,
                        py: 1,
                        color: isActive
                          ? "#16a34a"
                          : "text.secondary",
                        bgcolor: (theme) =>
                          isActive
                            ? theme.palette.mode === "dark"
                              ? "rgba(22, 163, 74, 0.15)"
                              : "#f0fdf4"
                            : "transparent",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&:hover": {
                          bgcolor: (theme) =>
                            isActive
                              ? theme.palette.mode === "dark"
                                ? "rgba(22, 163, 74, 0.25)"
                                : "#dcfce7"
                              : "action.hover",
                          color: isActive ? "#15803d" : "text.primary",
                          transform: "translateY(-1px)",
                        },
                        "& .MuiButton-startIcon": {
                          marginRight: 0.75,
                          transition: "color 0.2s ease",
                        },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
            </Box>

            {/* Right Section: Actions & Auth */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1.5 },
                flex: 1,
                justifyContent: "flex-end",
              }}
            >
              {isAuthenticated ? (
                <>
                  {roles.includes("LECTURER") && (
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
                  {roles.includes("ADMIN") && (
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
                  {roles.includes("STUDENT") && (
                    <IconButton
                      component={Link}
                      href="/cart"
                      sx={{
                        color: "text.secondary",
                        bgcolor: "background.default",
                        border: "1px solid",
                        borderColor: "divider",
                        "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                      }}
                    >
                      <ShoppingCart size={20} />
                    </IconButton>
                  )}
                  <NotificationCenter />
                  <ThemeToggle />
                  <UserMenu />
                </>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <ThemeToggle />
                  <Button
                    component={Link}
                    href="/login"
                    variant="text"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      px: { xs: 1.5, sm: 2 },
                      "&:hover": { bgcolor: "action.hover", color: "text.primary" },
                      display: { xs: "none", sm: "flex" },
                    }}
                  >
                    Log in
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
                      px: { xs: 2, sm: 3 },
                      py: 0.8,
                      fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                      "&:hover": { bgcolor: "#15803d" },
                    }}
                  >
                    Sign up
                  </Button>
                </Box>
              )}
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: 280,
            boxSizing: "border-box",
            bgcolor: "background.paper",
            p: 2.5,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, px: 0.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#16a34a",
              color: "#ffffff",
              width: 34,
              height: 34,
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)",
            }}
          >
            <Code2 size={18} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary" }}>
            DevEdu
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List disablePadding>
          {studentNavItems
            .filter((item) => {
              if (item.href === "/my-courses") {
                return isAuthenticated && roles.includes("STUDENT");
              }
              return true;
            })
            .map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <ListItem key={item.href} disablePadding sx={{ mb: 0.75 }}>
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 2.5,
                      py: 1.2,
                      px: 2,
                      bgcolor: (theme) =>
                        isActive
                          ? theme.palette.mode === "dark"
                            ? "rgba(22, 163, 74, 0.15)"
                            : "#f0fdf4"
                          : "transparent",
                      color: isActive ? "#16a34a" : "text.secondary",
                      fontWeight: isActive ? 700 : 600,
                      "&:hover": {
                        bgcolor: (theme) =>
                          isActive
                            ? theme.palette.mode === "dark"
                              ? "rgba(22, 163, 74, 0.25)"
                              : "#dcfce7"
                            : "action.hover",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isActive ? "#16a34a" : "text.secondary",
                      }}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "0.95rem",
                          fontWeight: isActive ? 700 : 600,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
        </List>

        {isAuthenticated && (roles.includes("LECTURER") || roles.includes("ADMIN")) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {roles.includes("LECTURER") && (
                <Button
                  component={Link}
                  href="/lecturer"
                  onClick={() => setMobileOpen(false)}
                  variant="outlined"
                  size="small"
                  startIcon={<UserCheck size={16} />}
                  sx={{
                    borderRadius: 999,
                    borderColor: "rgba(245, 158, 11, 0.4)",
                    color: "#f59e0b",
                    fontWeight: 700,
                    justifyContent: "flex-start",
                    py: 1,
                    px: 2,
                    textTransform: "none",
                  }}
                >
                  Switch to Lecturer Portal
                </Button>
              )}
              {roles.includes("ADMIN") && (
                <Button
                  component={Link}
                  href="/admin"
                  onClick={() => setMobileOpen(false)}
                  variant="outlined"
                  size="small"
                  startIcon={<Shield size={16} />}
                  sx={{
                    borderRadius: 999,
                    borderColor: "rgba(239, 68, 68, 0.4)",
                    color: "#ef4444",
                    fontWeight: 700,
                    justifyContent: "flex-start",
                    py: 1,
                    px: 2,
                    textTransform: "none",
                  }}
                >
                  Switch to Admin Portal
                </Button>
              )}
            </Box>
          </>
        )}

        {!isAuthenticated && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                component={Link}
                href="/login"
                onClick={() => setMobileOpen(false)}
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  fontWeight: 600,
                  color: "text.secondary",
                  borderColor: "divider",
                  py: 1,
                }}
              >
                Log in
              </Button>
              <Button
                component={Link}
                href="/register"
                onClick={() => setMobileOpen(false)}
                variant="contained"
                disableElevation
                sx={{
                  borderRadius: 999,
                  fontWeight: 600,
                  bgcolor: "#16a34a",
                  py: 1,
                  "&:hover": { bgcolor: "#15803d" },
                }}
              >
                Sign up
              </Button>
            </Box>
          </>
        )}
      </Drawer>
    </>
  );
}
