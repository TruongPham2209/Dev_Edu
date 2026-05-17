import { Box, Typography, Button, Avatar, Stack, Paper } from "@mui/material";
import { Camera, Key, Mail, Calendar, Shield } from "lucide-react";
import type { AuthUser } from "@/lib/auth-storage";
import { useState } from "react";
import { ChangePasswordModal } from "./change-password-modal";
import { AvatarUploadModal } from "./avatar-upload-modal";

interface ProfileHeaderProps {
  user: AuthUser;
  onAvatarChange: (newAvatarUrl: string) => void;
}

export function ProfileHeader({ user, onAvatarChange }: ProfileHeaderProps) {
  const [openPassword, setOpenPassword] = useState(false);
  const [openAvatar, setOpenAvatar] = useState(false);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN": return "Quản trị viên";
      case "LECTURER": return "Giảng viên";
      case "STUDENT": return "Học viên";
      default: return role;
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: { xs: 3, md: 4 }, 
        borderRadius: 4, 
        border: "1px solid rgba(0,0,0,0.05)",
        bgcolor: "#ffffff",
        mb: 4,
        position: "relative",
        overflow: "hidden"
      }}
    >
      <Box 
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
          background: "linear-gradient(90deg, #f0f9ff 0%, #e0f2fe 100%)",
          zIndex: 0
        }}
      />
      
      <Box sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 4, alignItems: { xs: "center", sm: "flex-end" }, mt: 4 }}>
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={user.avatarUrl || undefined}
            sx={{
              width: 120,
              height: 120,
              border: "4px solid #fff",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              bgcolor: "#0ea5e9",
              fontSize: "3rem",
              fontWeight: 700
            }}
          >
            {user.fullName.charAt(0).toUpperCase()}
          </Avatar>
          <Button
            onClick={() => setOpenAvatar(true)}
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              minWidth: "auto",
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: "#fff",
              color: "#475569",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              "&:hover": { bgcolor: "#f8fafc", color: "#0f172a" }
            }}
          >
            <Camera size={18} />
          </Button>
        </Box>

        <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}>
            {user.fullName}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#64748b", mb: 2 }}>
            @{user.username}
          </Typography>

          <Stack 
            direction={{ xs: "column", sm: "row" }} 
            spacing={3} 
            sx={{ color: "#475569", alignItems: { xs: "center", sm: "flex-start" } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Mail size={16} />
              <Typography variant="body2">{user.email || "Chưa cập nhật email"}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Shield size={16} />
              <Typography variant="body2">{getRoleLabel(user.role)}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Calendar size={16} />
              <Typography variant="body2">Thành viên mới</Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignSelf: { xs: "center", sm: "flex-end" } }}>
          <Button 
            variant="outlined" 
            startIcon={<Key size={16} />}
            onClick={() => setOpenPassword(true)}
            sx={{ 
              borderRadius: 2, 
              color: "#334155", 
              borderColor: "#e2e8f0",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" }
            }}
          >
            Đổi mật khẩu
          </Button>
        </Box>
      </Box>

      <ChangePasswordModal open={openPassword} onClose={() => setOpenPassword(false)} />
      <AvatarUploadModal open={openAvatar} onClose={() => setOpenAvatar(false)} onSuccess={onAvatarChange} />
    </Paper>
  );
}
