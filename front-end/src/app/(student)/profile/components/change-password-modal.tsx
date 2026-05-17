import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Alert } from "@mui/material";
import { useState } from "react";
import { changePassword } from "@/lib/api/users";

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await changePassword(oldPassword, newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Đổi mật khẩu</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">Đổi mật khẩu thành công!</Alert>}
            <TextField
              label="Mật khẩu hiện tại"
              type="password"
              fullWidth
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <TextField
              label="Mật khẩu mới"
              type="password"
              fullWidth
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Xác nhận mật khẩu mới"
              type="password"
              fullWidth
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} disabled={loading} color="inherit">
            Hủy
          </Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ bgcolor: "#0f172a" }}>
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
