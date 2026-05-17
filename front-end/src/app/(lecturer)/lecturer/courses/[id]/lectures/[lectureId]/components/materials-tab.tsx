"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Collapse,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import {
  FileText,
  File,
  Video,
  Image as ImageIcon,
  Download,
  Trash2,
  Plus,
  X,
  UploadCloud,
  Loader2,
  FileArchive,
  FilePlus2,
} from "lucide-react";
import {
  getMaterials,
  createMaterial,
  deleteMaterial,
} from "@/lib/api/lectures";
import { getPreSignedUploadUrl, getDownloadUrl } from "@/lib/api/files";
import type { MaterialResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { formatServerDate } from "@/lib/date-utils";

interface MaterialsTabProps {
  lectureId: string;
  onCountChange?: (count: number) => void;
}

export function MaterialsTab({ lectureId, onCountChange }: MaterialsTabProps) {
  const theme = useTheme();
  const { handleError, showSuccess } = useApiWithToast();

  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [titleError, setTitleError] = useState("");
  const [fileError, setFileError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exitingIds, setExitingIds] = useState<string[]>([]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await getMaterials(lectureId);
      setMaterials(data);
    } catch (err) {
      handleError(err, "Không thể tải danh sách tài liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [lectureId]);

  useEffect(() => {
    onCountChange?.(materials.length);
  }, [materials, onCountChange]);

  // File type helper
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const sx = { size: 24, className: "text-slate-500" };

    if (!ext) return <File {...sx} />;

    switch (ext) {
      case "pdf":
        return <FileText size={24} style={{ color: "#ef4444" }} />;
      case "doc":
      case "docx":
        return <FileText size={24} style={{ color: "#3b82f6" }} />;
      case "xls":
      case "xlsx":
        return <FileText size={24} style={{ color: "#10b981" }} />;
      case "ppt":
      case "pptx":
        return <FileText size={24} style={{ color: "#f59e0b" }} />;
      case "zip":
      case "rar":
      case "7z":
        return <FileArchive size={24} style={{ color: "#8b5cf6" }} />;
      case "mp4":
      case "webm":
      case "mkv":
        return <Video size={24} style={{ color: "#ec4899" }} />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return <ImageIcon size={24} style={{ color: "#06b6d4" }} />;
      default:
        return <File size={24} style={{ color: "#64748b" }} />;
    }
  };

  // Drag and Drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (uploading) return;

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (uploading) return;

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelection(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    // Limit file size to 100MB for materials
    if (selectedFile.size > 100 * 1024 * 1024) {
      setFileError("Dung lượng tệp không được vượt quá 100MB");
      return;
    }

    setFile(selectedFile);
    setFileError("");

    // If title is empty, prefill with file name (without extension)
    if (!title.trim()) {
      const nameWithoutExt = selectedFile.name.substring(
        0,
        selectedFile.name.lastIndexOf("."),
      );
      setTitle(nameWithoutExt || selectedFile.name);
      setTitleError("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError("");
  };

  const handleDownload = async (material: MaterialResponse) => {
    try {
      const res = await getDownloadUrl(material.fileObjectKey);
      const downloadUrl = res.downloadUrl || res.publicUrl;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        throw new Error("Không thể tạo đường dẫn tải xuống");
      }
    } catch (err) {
      handleError(err, "Không thể tải xuống tệp");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteMaterial(deletingId);
      showSuccess("Đã xóa tài liệu");

      // Smooth exit animation
      setExitingIds((prev) => [...prev, deletingId]);
    } catch (err) {
      handleError(err, "Không thể xóa tài liệu");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnimationExited = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    setExitingIds((prev) => prev.filter((exId) => exId !== id));
  };

  const handleOpenDialog = () => {
    setTitle("");
    setFile(null);
    setTitleError("");
    setFileError("");
    setUploadProgress(0);
    setUploading(false);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (uploading) return;
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    let hasError = false;

    if (!title.trim()) {
      setTitleError("Vui lòng nhập tiêu đề tài liệu");
      hasError = true;
    } else {
      setTitleError("");
    }

    if (!file) {
      setFileError("Vui lòng chọn hoặc kéo thả tệp tài liệu");
      hasError = true;
    } else {
      setFileError("");
    }

    if (hasError) return;

    setUploading(true);
    setUploadProgress(5);

    try {
      // 1. Get Presigned S3 Upload URL
      const preSignRes = await getPreSignedUploadUrl({
        fileName: file!.name,
        contentType: file!.type || "application/octet-stream",
        fileSize: file!.size,
        isPublic: false,
      });

      if (!preSignRes.uploadUrl || !preSignRes.objectKey) {
        throw new Error("Không thể tạo đường dẫn tải lên");
      }

      setUploadProgress(20);

      // 2. Upload file to S3 with Progress Tracking
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", preSignRes.uploadUrl!, true);
        xhr.setRequestHeader(
          "Content-Type",
          file!.type || "application/octet-stream",
        );

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            // Scale progress between 20% and 85% during S3 transfer
            const percent = Math.round((e.loaded / e.total) * 65) + 20;
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Tải lên thất bại: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () =>
          reject(new Error("Lỗi kết nối trong quá trình tải lên"));
        xhr.send(file);
      });

      setUploadProgress(90);

      // 3. Call Material Creation API
      const newMaterial = await createMaterial({
        lectureId,
        title: title.trim(),
        fileObjectKey: preSignRes.objectKey,
      });

      setUploadProgress(100);
      showSuccess("Đã thêm tài liệu thành công");

      // ALWAYS append newly created item to the TOP of the list
      setMaterials((prev) => [newMaterial, ...prev]);

      setDialogOpen(false);
    } catch (err) {
      handleError(err, "Không thể tải lên tài liệu");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <Stack spacing={2} sx={{ mt: 1 }}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card
            key={idx}
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "divider",
              p: 2,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "grey.100",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    width: "40%",
                    height: 20,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Box
                  sx={{
                    width: "25%",
                    height: 14,
                    bgcolor: "grey.100",
                    borderRadius: 0.5,
                  }}
                />
              </Box>
            </Stack>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Tài liệu đính kèm
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Danh sách tài liệu học tập, slide bài giảng hoặc bài đọc thêm.
          </Typography>
        </Box>
        <Tooltip title="Thêm tài liệu" arrow>
          <IconButton
            onClick={handleOpenDialog}
            sx={{
              width: 42,
              height: 42,
              borderRadius: 3,
              bgcolor: "primary.main",
              color: "white",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.18)",
              transition: "all 0.2s ease",

              "&:hover": {
                bgcolor: "primary.dark",
                transform: "translateY(-1px) scale(1.03)",
                boxShadow: "0 6px 18px rgba(25, 118, 210, 0.28)",
              },
            }}
          >
            <FilePlus2 size={20} strokeWidth={2.2} />
          </IconButton>
        </Tooltip>
      </Box>

      {materials.length === 0 ? (
        <EmptyState
          title="Chưa có tài liệu nào"
          subtitle="Tải lên tài liệu PDF, Slide, Zip hoặc Video để học sinh tham khảo."
          icon={<File size={40} />}
        />
      ) : (
        <Stack spacing={2}>
          {materials.map((material) => {
            const isExiting = exitingIds.includes(material.id);
            const fileName = material.fileOriginalName || material.title;
            const extension = fileName.split(".").pop()?.toUpperCase() || "Tệp";

            return (
              <Collapse
                key={material.id}
                in={!isExiting}
                timeout={300}
                onExited={() => handleAnimationExited(material.id)}
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: "divider",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.light",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.03)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: "16px !important" }}>
                    <Stack
                      direction="row"
                      spacing={2}
                      sx={{
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: "center", minWidth: 0 }}
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            bgcolor: "grey.50",
                            border: "1px solid",
                            borderColor: "grey.100",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getFileIcon(fileName)}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 700,
                              color: "#1e293b",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {material.title}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{
                              alignItems: "center",
                              flexWrap: "wrap",
                              mt: 0.5,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary", fontWeight: 500 }}
                            >
                              Định dạng: {extension}
                            </Typography>
                            <Box
                              sx={{
                                width: 4,
                                height: 4,
                                borderRadius: "50%",
                                bgcolor: "grey.300",
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: "text.secondary" }}
                            >
                              Tải lên:{" "}
                              {formatServerDate(
                                material.uploadedAt,
                                "datetime",
                              )}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>

                      <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                        <IconButton
                          onClick={() => handleDownload(material)}
                          size="small"
                          sx={{
                            color: "primary.main",
                            bgcolor: "rgba(37, 99, 235, 0.04)",
                            "&:hover": { bgcolor: "rgba(37, 99, 235, 0.1)" },
                            borderRadius: 2,
                            p: 1.25,
                          }}
                        >
                          <Download size={18} />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDeleteClick(material.id)}
                          size="small"
                          sx={{
                            color: "error.main",
                            bgcolor: "rgba(239, 68, 68, 0.04)",
                            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" },
                            borderRadius: 2,
                            p: 1.25,
                          }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Collapse>
            );
          })}
        </Stack>
      )}

      {/* Upload Material Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Tải lên tài liệu
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
            disabled={uploading}
            size="small"
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}
        >
          <TextField
            label="Tiêu đề tài liệu *"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError("");
            }}
            error={Boolean(titleError)}
            helperText={titleError}
            fullWidth
            disabled={uploading}
            variant="outlined"
            slotProps={{
              input: {
                sx: { borderRadius: 2.5 },
              },
            }}
          />

          {file ? (
            // Local Preview Card
            <Card
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                borderColor: "primary.light",
                bgcolor: "rgba(37, 99, 235, 0.02)",
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                sx={{ alignItems: "center", justifyContent: "space-between" }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center", minWidth: 0 }}
                >
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: "primary.main",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {getFileIcon(file.name)}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 750,
                        color: "#1e293b",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {file.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {(file.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                      {file.type || "Tệp tài liệu"}
                    </Typography>
                  </Box>
                </Stack>
                {!uploading && (
                  <IconButton
                    onClick={handleRemoveFile}
                    size="small"
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        color: "error.main",
                        bgcolor: "rgba(239, 68, 68, 0.05)",
                      },
                      borderRadius: 2,
                    }}
                  >
                    <X size={18} />
                  </IconButton>
                )}
              </Stack>
            </Card>
          ) : (
            // Drag and Drop Area
            <Box
              sx={{
                p: 4,
                border: "2px dashed",
                borderColor: dragActive ? "primary.main" : "divider",
                borderRadius: 3,
                bgcolor: dragActive ? "rgba(37, 99, 235, 0.04)" : "grey.50",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "rgba(37, 99, 235, 0.02)",
                },
              }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Stack spacing={1.5} sx={{ alignItems: "center" }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    bgcolor: "rgba(37, 99, 235, 0.06)",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <UploadCloud size={28} />
                </Box>
                <Box>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 700, color: "#1e293b" }}
                  >
                    Kéo thả tài liệu vào đây hoặc nhấp để chọn
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
                  >
                    Hỗ trợ các định dạng PDF, Docx, Xlsx, Pptx, Zip, Video,
                    Ảnh... Tối đa 100MB.
                  </Typography>
                </Box>
              </Stack>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                onChange={handleFileChange}
              />
            </Box>
          )}

          {fileError && (
            <Typography
              variant="caption"
              color="error"
              sx={{ fontWeight: 500 }}
            >
              {fileError}
            </Typography>
          )}

          {uploading && (
            <Box sx={{ mt: 1 }}>
              <Stack
                direction="row"
                sx={{
                  justifyContent: "space-between",
                  mb: 1,
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  Đang tải tài liệu lên đám mây...
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: "primary.main" }}
                >
                  {uploadProgress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: "grey.100",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={uploading}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={uploading || !title.trim() || !file}
            startIcon={
              uploading ? <Loader2 size={16} className="animate-spin" /> : null
            }
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 1,
              fontWeight: 700,
              textTransform: "none",
              minWidth: 120,
            }}
          >
            {uploading ? `Đang lưu...` : "Tải lên"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Xóa tài liệu?"
        description="Học sinh sẽ không thể xem hoặc tải tài liệu này nữa. Hành động không thể hoàn tác."
        confirmLabel="Xóa tài liệu"
        cancelLabel="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Box>
  );
}
