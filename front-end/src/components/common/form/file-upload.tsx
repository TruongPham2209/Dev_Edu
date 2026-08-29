"use client";

import {
  formatBytes,
  getFileAcceptString,
  getFileIcon,
  isValidFileType,
} from "@/lib/util/file-utils";
import {
  Box,
  FormHelperText,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { UploadCloud, X } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

export interface FileUploadProps {
  value?: string | null; // Existing file URL from database
  file: File | null; // Local selected file
  onChange: (file: File | null) => void;
  onClear?: () => void;
  error?: boolean;
  helperText?: string;
  maxSizeMB?: number;
  width?: string | number;
  height?: string | number;
  accept?: string;
  fileType?: "image" | "video" | "document";
  fileExtensions?: string[]; // e.g. [".pdf", ".docx"] or ["pdf", "docx"]
  disabled?: boolean;
}

export function FileUpload({
  value,
  file,
  onChange,
  onClear,
  error,
  helperText,
  maxSizeMB = 5,
  width = "100%",
  height = 200,
  accept,
  fileType,
  fileExtensions,
  disabled = false,
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Priority: fileType > fileExtensions. Default to "image" only if neither is provided.
  const effectiveFileType =
    fileType !== undefined
      ? fileType
      : !fileExtensions || fileExtensions.length === 0
        ? "image"
        : undefined;

  const normalizedExtensions = React.useMemo(() => {
    if (!fileExtensions || fileExtensions.length === 0) return [];
    return fileExtensions.map((ext) =>
      ext.trim().replace(/^\./, "").toLowerCase(),
    );
  }, [fileExtensions]);

  // Generate preview URL for local selected file
  const localPreview = React.useMemo(() => {
    if (file) {
      return URL.createObjectURL(file);
    }
    return null;
  }, [file]);

  // Clean up local object URL to prevent memory leaks
  React.useEffect(() => {
    return () => {
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const activePreview = localPreview || value;

  // Determine preview mode
  const isImagePreview = React.useMemo(() => {
    if (effectiveFileType === "image") return true;
    if (effectiveFileType === "video" || effectiveFileType === "document")
      return false;
    const name = file?.name || value || "";
    const ext = name.split(".").pop()?.toLowerCase();
    return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || "");
  }, [effectiveFileType, file, value]);

  const isVideoPreview = React.useMemo(() => {
    if (effectiveFileType === "video") return true;
    if (effectiveFileType === "image" || effectiveFileType === "document")
      return false;
    const name = file?.name || value || "";
    const ext = name.split(".").pop()?.toLowerCase();
    return ["mp4", "webm", "mkv", "mov", "avi"].includes(ext || "");
  }, [effectiveFileType, file, value]);

  const validateAndProcessFile = useCallback(
    (selectedFile: File) => {
      setLocalError(null);

      // Validate by fileType or fileExtensions (fileType > fileExtensions)
      if (effectiveFileType) {
        if (!isValidFileType(selectedFile.type, effectiveFileType)) {
          setLocalError(
            `Unsupported file format. Please upload a valid ${effectiveFileType}.`,
          );
          return;
        }
      } else if (normalizedExtensions.length > 0) {
        const fileExt =
          selectedFile.name.split(".").pop()?.toLowerCase() || "";
        if (!normalizedExtensions.includes(fileExt)) {
          setLocalError(
            `Unsupported file format. Allowed extensions: ${normalizedExtensions.map((e) => `.${e.toUpperCase()}`).join(", ")}.`,
          );
          return;
        }
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        setLocalError(`File size must not exceed ${maxSizeMB}MB.`);
        return;
      }

      onChange(selectedFile);
    },
    [effectiveFileType, normalizedExtensions, maxSizeMB, onChange],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      setIsDragActive(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        validateAndProcessFile(droppedFile);
      }
    },
    [disabled, validateAndProcessFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        validateAndProcessFile(selectedFile);
      }
    },
    [disabled, validateAndProcessFile],
  );

  const handleButtonClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (disabled) return;
      onChange(null);
      if (onClear) {
        onClear();
      }
      setLocalError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [disabled, onChange, onClear],
  );

  const activeError = error || Boolean(localError);
  const displayHelperText = localError || helperText;

  return (
    <Box sx={{ width }}>
      <Box
        onClick={handleButtonClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        sx={{
          width: "100%",
          height:
            typeof height === "number"
              ? { xs: Math.min(160, height), sm: height }
              : height,
          borderRadius: 1,
          border: "2px dashed",
          borderColor: activeError
            ? "error.main"
            : isDragActive
              ? "primary.main"
              : "divider",
          bgcolor: isDragActive
            ? "action.selected"
            : "action.hover",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.75 : 1,
          position: "relative",
          overflow: "hidden",
          transition: "all 0.22s ease",

          "&:hover": {
            borderColor: activeError
              ? "error.main"
              : disabled
                ? "divider"
                : "primary.main",
            bgcolor: "action.hover",
            "& .upload-overlay": {
              opacity: disabled ? 0 : 1,
            },
          },
        }}
      >
        {activePreview ? (
          <>
            {isImagePreview ? (
              <Box
                component="img"
                src={activePreview}
                alt="Preview"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : isVideoPreview ? (
              <Box
                component="video"
                src={activePreview}
                controls
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  bgcolor: "black",
                }}
              />
            ) : (
              <Stack
                spacing={1.5}
                sx={{ alignItems: "center", p: 3, textAlign: "center" }}
              >
                <Box sx={{ color: "primary.main" }}>
                  {getFileIcon(file?.name || value || "", 44)}
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {file ? file.name : "Document Selected"}
                </Typography>
                {file && (
                  <Typography variant="caption" color="text.secondary">
                    {formatBytes(file.size)}
                  </Typography>
                )}
              </Stack>
            )}

            {/* Hover overlay to change image */}
            {!disabled && (
              <Box
                className="upload-overlay"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: "rgba(15, 23, 42, 0.6)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  opacity: 0,
                  transition: "opacity 0.22s ease",
                }}
              >
                <UploadCloud size={28} />
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
                  Change File
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, mt: 0.5 }}>
                  Drag and drop or click to replace
                </Typography>
              </Box>
            )}

            {/* Remove button */}
            {!disabled && (
              <IconButton
                size="small"
                onClick={handleRemove}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "background.paper",
                  color: "text.primary",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  zIndex: 2,
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "error.main",
                    color: "white",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <X size={16} />
              </IconButton>
            )}
          </>
        ) : (
          <Stack
            spacing={1.5}
            sx={{ alignItems: "center", p: 3, textAlign: "center" }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: "50%",
                bgcolor: "rgba(15, 23, 42, 0.04)",
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UploadCloud size={28} className="text-slate-400" />
            </Box>
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.primary" }}
              >
                Upload File
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 0.5 }}
              >
                Drag and drop your file here, or{" "}
                <Box
                  component="span"
                  sx={{ color: "primary.main", fontWeight: 600 }}
                >
                  browse
                </Box>
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", opacity: 0.8 }}
            >
              Supports{" "}
              {effectiveFileType === "image"
                ? "JPG, PNG, GIF, WEBP"
                : effectiveFileType === "video"
                  ? "MP4, AVI, MKV, WEBM, MOV"
                  : effectiveFileType === "document"
                    ? "PDF, DOC, XLS, PPT, ZIP, TXT"
                    : normalizedExtensions.map((e) => e.toUpperCase()).join(", ")}{" "}
              (Max {maxSizeMB}MB)
            </Typography>
          </Stack>
        )}

        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept={
            accept ||
            (effectiveFileType
              ? getFileAcceptString(effectiveFileType)
              : normalizedExtensions.length > 0
                ? normalizedExtensions.map((e) => `.${e}`).join(",")
                : "*")
          }
          onChange={handleFileChange}
          disabled={disabled}
        />
      </Box>
      {displayHelperText && (
        <FormHelperText error={activeError} sx={{ mx: 1.5, mt: 0.75 }}>
          {displayHelperText}
        </FormHelperText>
      )}
    </Box>
  );
}
