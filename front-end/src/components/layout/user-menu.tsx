"use client";

import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/use-auth";
import { clearAuthSession } from "@/lib/auth-storage";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/logout/actions";

export function UserMenu() {
  const router = useRouter();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleLogout = async () => {
    setAnchorEl(null);
    clearAuthSession();
    try {
      await logoutAction();
    } catch (err) {
      console.error("Failed to perform server logout:", err);
    }
    router.replace("/home");
    router.refresh();
  };

  if (!user) {
    return null;
  }

  const initials = user.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.username.slice(0, 2).toUpperCase();

  return (
    <Box>
      <IconButton onClick={(event) => setAnchorEl(event.currentTarget)}>
        <Avatar sx={{ width: 36, height: 36 }}>{initials}</Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#ffffff",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {user.fullName}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {user.role}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          component={Link}
          href="/profile"
          onClick={() => setAnchorEl(null)}
        >
          <User size={16} style={{ marginRight: 8 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogOut size={16} style={{ marginRight: 8 }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
}
