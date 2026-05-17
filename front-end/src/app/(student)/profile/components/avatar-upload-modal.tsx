import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  Typography,
} from "@mui/material";
import { useState, useRef } from "react";
import { getPreSignedUploadUrl, confirmImageUpload } from "@/lib/api/files";
import { updateAvatar } from "@/lib/api/users";
import { UploadCloud } from "lucide-react";

interface AvatarUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (newAvatarUrl: string) => void;
}

export function AvatarUploadModal({
  open,
  onClose,
  onSuccess,
}: AvatarUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      // Get pre-signed URL
      const preSignRes = await getPreSignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        isPublic: true,
      });

      // Upload to pre-signed URL
      await fetch(preSignRes.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Confirm upload
      await confirmImageUpload(preSignRes.objectKey);

      // Update avatar
      await updateAvatar(preSignRes.objectKey);

      onSuccess(preSignRes.publicUrl || preSignRes.downloadUrl || "");
      onClose();
    } catch (err: any) {
      setError(err.message || "Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Đổi ảnh đại diện</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2, alignItems: "center" }}>
          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          <Box
            onClick={() => fileInputRef.current?.click()}
            sx={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              border: "2px dashed #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              "&:hover": {
                borderColor: "#3b82f6",
                bgcolor: "#f8fafc",
              },
            }}
          >
            {preview ? (
              <Box
                component="img"
                src={preview}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Stack
                spacing={1}
                sx={{ color: "#64748b", alignItems: "center" }}
              >
                <UploadCloud size={32} />
                <Typography variant="caption">Chọn ảnh</Typography>
              </Stack>
            )}
          </Box>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Hủy
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || loading}
          sx={{ bgcolor: "#0f172a" }}
        >
          {loading ? "Đang tải lên..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
