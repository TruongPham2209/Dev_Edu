import { FileUpload } from "@/components/common/form/file-upload";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { ImagePreview } from "@/components/common/image-preview";
import { confirmImageUpload, getPreSignedUploadUrl } from "@/lib/api/files";
import { changePassword, updateAvatar } from "@/lib/api/users";
import type { AuthUser } from "@/lib/auth-storage";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Camera, Eye, EyeOff, Key, Mail, Shield } from "lucide-react";
import { useState } from "react";

interface ProfileHeaderProps {
  user: AuthUser;
  onAvatarChange: (newAvatarUrl: string) => void;
}

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export function ProfileHeader({ user, onAvatarChange }: ProfileHeaderProps) {
  const [openPassword, setOpenPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [openAvatar, setOpenAvatar] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const { handleError, showSuccess } = useApiWithToast();

  const isNewPasswordValid = newPassword
    ? PASSWORD_REGEX.test(newPassword)
    : true;
  const isNewPasswordDifferent =
    newPassword && oldPassword ? newPassword !== oldPassword : true;

  const handleClosePassword = () => {
    setOldPassword("");
    setNewPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setOpenPassword(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return;
    if (!PASSWORD_REGEX.test(newPassword)) {
      handleError(new Error("New password is not strong enough."));
      return;
    }
    if (newPassword === oldPassword) {
      handleError(
        new Error("New password must be different from current password."),
      );
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      showSuccess("Changed password successfully!");
      handleClosePassword();
    } catch (err: any) {
      handleError(err, "Failed to change password.");
      throw err;
    }
  };

  const handleUploadAvatar = async () => {
    if (!file) return;
    try {
      const preSignRes = await getPreSignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        isPublic: true,
      });

      const uploadUrl = preSignRes.uploadUrl ?? "";
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      await confirmImageUpload(preSignRes.objectKey);
      await updateAvatar(preSignRes.objectKey);

      onAvatarChange(preSignRes.publicUrl || preSignRes.downloadUrl || "");
      showSuccess("Updated avatar successfully!");
      setOpenAvatar(false);
      setFile(null);
    } catch (err: any) {
      handleError(err, "Upload failed. Please try again.");
      throw err;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "Administrator";
      case "LECTURER":
        return "Lecturer";
      case "STUDENT":
        return "Student";
      default:
        return role;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 1,
        border: "1px solid rgba(0,0,0,0.05)",
        bgcolor: "#ffffff",
        mb: 4,
        position: "relative",
        overflow: "hidden",
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
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 4,
          alignItems: { xs: "center", sm: "flex-end" },
          mt: 4,
        }}
      >
        <Box sx={{ position: "relative" }}>
          <Avatar
            src={user.avatarUrl || undefined}
            onClick={() => {
              if (user.avatarUrl) setOpenPreview(true);
            }}
            sx={{
              width: 120,
              height: 120,
              border: "4px solid #fff",
              boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
              bgcolor: "#0ea5e9",
              fontSize: "3rem",
              fontWeight: 700,
              cursor: user.avatarUrl ? "pointer" : "default",
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
              "&:hover": { bgcolor: "#f8fafc", color: "#0f172a" },
            }}
          >
            <Camera size={18} />
          </Button>
        </Box>

        <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: "#0f172a", mb: 0.5 }}
          >
            {user.fullName}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#64748b", mb: 2 }}>
            @{user.username}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{
              color: "#475569",
              alignItems: { xs: "center", sm: "flex-start" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Mail size={16} />
              <Typography variant="body2">{user.email}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Shield size={16} />
              <Typography variant="body2">{getRoleLabel(user.role)}</Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignSelf: { xs: "center", sm: "flex-end" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Key size={16} />}
            onClick={() => setOpenPassword(true)}
            sx={{
              borderRadius: 2,
              color: "#334155",
              borderColor: "#e2e8f0",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
            }}
          >
            Change password
          </Button>
        </Box>
      </Box>

      <FormDialog
        open={openPassword}
        onClose={handleClosePassword}
        title="Change password"
        headerIcon={<Key size={24} />}
        submitText="Save"
        cancelText="Cancel"
        onSubmit={handleChangePassword}
        isSubmitDisabled={
          !oldPassword ||
          !newPassword ||
          !isNewPasswordValid ||
          !isNewPasswordDifferent
        }
        maxWidth="sm"
      >
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          <FormInput
            label="Current password"
            type={showOldPassword ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Enter current password"
            icon={showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            iconPosition="end"
            onIconClick={() => setShowOldPassword(!showOldPassword)}
          />

          <FormInput
            label="New password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            icon={showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            iconPosition="end"
            onIconClick={() => setShowNewPassword(!showNewPassword)}
            error={
              !!newPassword && (!isNewPasswordValid || !isNewPasswordDifferent)
            }
            helperText={
              !!newPassword && !isNewPasswordDifferent
                ? "New password must be different from current password."
                : !!newPassword && !isNewPasswordValid
                  ? "New password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters (@$!%*?&)"
                  : undefined
            }
          />
        </Stack>
      </FormDialog>

      <FormDialog
        open={openAvatar}
        onClose={() => {
          setOpenAvatar(false);
          setFile(null);
        }}
        title="Update avatar"
        headerIcon={<Camera size={24} />}
        submitText="Save"
        cancelText="Cancel"
        isSubmitDisabled={!file}
        onSubmit={handleUploadAvatar}
        maxWidth="sm"
      >
        <Stack spacing={3} sx={{ mt: 1, alignItems: "center" }}>
          <FileUpload
            file={file}
            onChange={setFile}
            accept="image/*"
            fileType="image"
            maxSizeMB={5}
            width="100%"
            height={200}
          />
        </Stack>
      </FormDialog>

      <ImagePreview
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        src={user.avatarUrl}
        alt="Avatar"
      />
    </Paper>
  );
}
