import { FileUpload } from "@/components/common/form/file-upload";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { ImagePreview } from "@/components/common/image-preview";
import {
  useConfirmImageUploadMutation,
  usePreSignedUploadUrlMutation,
} from "@/lib/api/files";
import {
  useChangePasswordMutation,
  useUpdateAvatarMutation,
} from "@/lib/api/users";
import type { AuthUser } from "@/lib/auth-storage";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Avatar, Box, Button, Paper, Stack, Typography } from "@mui/material";
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

  const { mutateAsync: changePasswordMutate } = useChangePasswordMutation();
  const { mutateAsync: updateAvatarMutate } = useUpdateAvatarMutation();
  const { mutateAsync: getPreSignedUploadUrlMutate } = usePreSignedUploadUrlMutation();
  const { mutateAsync: confirmImageUploadMutate } = useConfirmImageUploadMutation();

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
      await changePasswordMutate({ oldPassword, newPassword });
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
      const preSignRes = await getPreSignedUploadUrlMutate({
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

      await confirmImageUploadMutate(preSignRes.objectKey);
      await updateAvatarMutate(preSignRes.objectKey);

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
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: { xs: 2, sm: 3 },
        border: "1px solid rgba(0,0,0,0.05)",
        bgcolor: "#ffffff",
        mb: { xs: 3, sm: 4 },
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
          height: { xs: "90px", sm: "120px" },
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
          flexWrap: { sm: "wrap", md: "nowrap" },
          gap: { xs: 2, sm: 3, md: 4 },
          alignItems: { xs: "center", sm: "center", md: "flex-end" },
          justifyContent: "space-between",
          mt: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Avatar & User Details */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "center", md: "flex-end" },
            gap: { xs: 2, sm: 3 },
            flex: 1,
            minWidth: 0,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          {/* Avatar */}
          <Box sx={{ position: "relative", flexShrink: 0 }}>
            <Avatar
              src={user.avatarUrl || undefined}
              onClick={() => {
                if (user.avatarUrl) setOpenPreview(true);
              }}
              sx={{
                width: { xs: 88, sm: 100, md: 120 },
                height: { xs: 88, sm: 100, md: 120 },
                border: "4px solid #fff",
                boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
                bgcolor: "#0ea5e9",
                fontSize: { xs: "2.2rem", sm: "2.5rem", md: "3rem" },
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
                width: { xs: 32, sm: 34, md: 36 },
                height: { xs: 32, sm: 34, md: 36 },
                borderRadius: "50%",
                bgcolor: "#fff",
                color: "#475569",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": { bgcolor: "#f8fafc", color: "#0f172a" },
              }}
            >
              <Camera size={16} />
            </Button>
          </Box>

          {/* Text Details */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                mb: 0.25,
                fontSize: { xs: "1.35rem", sm: "1.5rem", md: "2rem" },
                lineHeight: 1.2,
              }}
            >
              {user.fullName}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#64748b",
                mb: { xs: 1.5, sm: 1.5 },
                fontSize: { xs: "0.875rem", sm: "0.925rem", md: "1rem" },
              }}
            >
              @{user.username}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 2, md: 3 }}
              sx={{
                color: "#475569",
                alignItems: { xs: "center", sm: "flex-start" },
                fontSize: { xs: "0.825rem", sm: "0.85rem" },
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Mail size={16} color="#64748b" />
                <Typography variant="body2" sx={{ fontSize: "inherit" }}>
                  {user.email}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Shield size={16} color="#64748b" />
                <Typography variant="body2" sx={{ fontSize: "inherit" }}>
                  {getRoleLabel(user.role)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Change Password Button */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignSelf: { xs: "stretch", sm: "center", md: "flex-end" },
            width: { xs: "100%", sm: "auto" },
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Key size={16} />}
            onClick={() => setOpenPassword(true)}
            sx={{
              borderRadius: 2,
              color: "#334155",
              borderColor: "#cbd5e1",
              bgcolor: "#ffffff",
              textTransform: "none",
              fontWeight: 600,
              px: { xs: 2.5, sm: 2.5, md: 3 },
              py: { xs: 1, sm: 1 },
              fontSize: { xs: "0.875rem", sm: "0.9rem" },
              whiteSpace: "nowrap",
              width: { xs: "100%", sm: "auto" },
              boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#94a3b8" },
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
