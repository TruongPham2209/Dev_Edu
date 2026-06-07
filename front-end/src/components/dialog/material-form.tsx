"use client";

import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { usePreSignedUploadUrlMutation } from "@/lib/api/files";
import { useCreateMaterialMutation } from "@/lib/api/lectures";
import type { MaterialResponse } from "@/lib/type/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Card,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  File,
  FileArchive,
  FileText,
  Image as ImageIcon,
  Type,
  UploadCloud,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MaterialFormDialogProps {
  open: boolean;
  onClose: () => void;
  lectureId: string;
  onSuccess: (material: MaterialResponse) => void;
}

export function MaterialFormDialog({
  open,
  onClose,
  lectureId,
  onSuccess,
}: MaterialFormDialogProps) {
  const { handleError, showSuccess } = useApiWithToast();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [titleError, setTitleError] = useState("");
  const [fileError, setFileError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const { mutateAsync: preSignMutate } = usePreSignedUploadUrlMutation();
  const { mutateAsync: createMaterialMutate } = useCreateMaterialMutation();

  useEffect(() => {
    if (open) {
      setTitle("");
      setFile(null);
      setTitleError("");
      setFileError("");
      setUploadProgress(0);
      setUploading(false);
    }
  }, [open]);

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
      setFileError("File size exceeds 100MB");
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

  const handleCloseDialog = () => {
    if (uploading) return;
    onClose();
  };

  const handleSubmit = async () => {
    let hasError = false;

    if (!title.trim()) {
      setTitleError("Please enter title");
      hasError = true;
    } else {
      setTitleError("");
    }

    if (!file) {
      setFileError("Please upload material");
      hasError = true;
    } else {
      setFileError("");
    }

    if (hasError) return;

    setUploading(true);
    setUploadProgress(5);

    try {
      // 1. Get Presigned S3 Upload URL
      const preSignRes = await preSignMutate({
        fileName: file!.name,
        contentType: file!.type || "application/octet-stream",
        fileSize: file!.size,
        isPublic: false,
      });

      if (!preSignRes.uploadUrl || !preSignRes.objectKey) {
        throw new Error("Could not generate upload URL");
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
            reject(new Error(`Failed to upload: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error("Error connecting during upload"));
        xhr.send(file);
      });

      setUploadProgress(90);

      // 3. Call Material Creation API
      const newMaterial = await createMaterialMutate({
        lectureId,
        title: title.trim(),
        fileObjectKey: preSignRes.objectKey,
      });

      setUploadProgress(100);
      showSuccess("Added material successfully");

      onSuccess(newMaterial);
      onClose();
    } catch (err) {
      handleError(err, "Failed to upload material");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Upload Material"
      headerIcon={<UploadCloud size={20} />}
      submitText="Upload"
      isSubmitDisabled={uploading || !file || !title.trim()}
      maxWidth="sm"
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
        <FormInput
          label="Material title *"
          placeholder="Leture slide ..."
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value.trim()) setTitleError("");
          }}
          error={Boolean(titleError)}
          helperText={titleError}
          disabled={uploading}
          icon={<Type size={18} />}
          iconPosition="start"
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
                    {file.type || "Document file"}
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
                  Drag and drop files here or click to upload
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
                >
                  Support PDF, Docx, Xlsx, Pptx, Zip, Video, Image... up to
                  100MB.
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
          <Typography variant="caption" color="error" sx={{ fontWeight: 500 }}>
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
                Uploading material...
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "primary.main" }}
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
      </Box>
    </FormDialog>
  );
}
