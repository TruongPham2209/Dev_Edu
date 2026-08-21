"use client";

import { adminNavItems } from "@/lib/navigation";
import { roleThemes } from "@/lib/role-theme";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ManageHeader } from "./components/manage-header";
type AdminLayoutProps = {
  children: ReactNode;
};

export function AdminLayout({ children }: Readonly<AdminLayoutProps>) {
  const theme = roleThemes.admin;
  const muiTheme = useTheme();
  const mediaQueryMatch = useMediaQuery(muiTheme.breakpoints.down("md"), {
    noSsr: true,
    defaultMatches: false,
  });
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname() || "";

  useEffect(() => {
    setIsMobile(mediaQueryMatch);
  }, [mediaQueryMatch]);

  const effectiveCollapsed = isMobile ? false : isCollapsed;
  const drawerWidth = effectiveCollapsed ? 88 : 280;

  const drawerContent = (
    <Box sx={{ pt: 1 }}>
      <Box
        sx={{
          px: 2,
          pb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: effectiveCollapsed ? "center" : "space-between",
        }}
      >
        {!effectiveCollapsed && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              DevEdu
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Admin Console
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            size="small"
            onClick={() => setIsCollapsed((prev) => !prev)}
            sx={{ color: "text.secondary" }}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </IconButton>
        )}
      </Box>

      <Box sx={{ borderTop: "1px solid rgba(15, 23, 42, 0.08)", py: 1 }}>
        <List>
          {adminNavItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <ListItem key={item.label} disablePadding>
                <Tooltip
                  title={effectiveCollapsed ? item.label : ""}
                  placement="right"
                  arrow
                >
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setDrawerOpen(false);
                    }}
                    sx={{
                      py: 1.4,
                      px: effectiveCollapsed ? 2.25 : 2.5,
                      color: "text.primary",
                      borderRadius: 2,
                      mx: 1,
                      bgcolor: isActive
                        ? "rgba(22, 163, 74, 0.12)"
                        : "transparent",
                      border: isActive
                        ? "1px solid rgba(22, 163, 74, 0.28)"
                        : "1px solid transparent",
                      "&:hover": {
                        bgcolor: "rgba(22, 163, 74, 0.08)",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 32, color: "inherit" }}>
                      <Icon size={18} />
                    </ListItemIcon>
                    {!effectiveCollapsed && (
                      <ListItemText
                        primary={item.label}
                        sx={{
                          "& .MuiListItemText-primary": {
                            fontSize: "0.875rem",
                            fontWeight: 600,
                          },
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        height: { xs: "100dvh", md: "100vh" },
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
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

      <ManageHeader
        title="Admin Workspace"
        logoHref="/admin"
        isMobile={isMobile}
        menuOpen={drawerOpen}
        onMenuClick={() => setDrawerOpen(!drawerOpen)}
      />

      <Box
        sx={{
          display: "flex",
          flex: 1,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {!isMobile && (
          <Box
            sx={{
              width: drawerWidth,
              flexShrink: 0,
              bgcolor: "rgba(255, 255, 255, 0.92)",
              borderRight: "1px solid rgba(15, 23, 42, 0.08)",
              overflowY: "auto",
              height: "100%",
              transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {drawerContent}
          </Box>
        )}

        {isMobile && (
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            sx={{
              "& .MuiDrawer-paper": {
                width: 280,
                bgcolor: "rgba(255, 255, 255, 0.98)",
                borderRight: "1px solid rgba(15, 23, 42, 0.08)",
              },
            }}
          >
            {drawerContent}
          </Drawer>
        )}

        <Box
          sx={{
            flex: 1,
            p: { xs: 1.5, sm: 2, md: 3 },
            position: "relative",
            overflow: "auto",
            height: "100%",
          }}
        >
          <Box
            sx={{
              p: { xs: 1.5, sm: 2.5, md: 3 },
              borderRadius: { xs: 2, sm: 3 },
              border: "1px solid rgba(15, 23, 42, 0.08)",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
