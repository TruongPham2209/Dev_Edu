"use client";

import {
  Box,
  FormHelperText,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  File as FileIcon,
  UploadCloud,
  X,
  FileText,
  Video,
} from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { getFileAcceptString, isValidFileType } from "@/lib/util/file-utils";

interface FileUploadProps {
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
  fileType = "image",
}: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateAndProcessFile = useCallback(
    (selectedFile: File) => {
      setLocalError(null);

      // Validate file type
      if (!isValidFileType(selectedFile.type, fileType)) {
        setLocalError(
          `Unsupported file format. Please upload a valid ${fileType}.`,
        );
        return;
      }

      // Check file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        setLocalError(`File size must not exceed ${maxSizeMB}MB.`);
        return;
      }

      onChange(selectedFile);
    },
    [maxSizeMB, onChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

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

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        validateAndProcessFile(droppedFile);
      }
    },
    [validateAndProcessFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        validateAndProcessFile(selectedFile);
      }
    },
    [validateAndProcessFile],
  );

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      if (onClear) {
        onClear();
      }
      setLocalError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [onChange, onClear],
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
          height,
          borderRadius: 3,
          border: "2px dashed",
          borderColor: activeError
            ? "error.main"
            : isDragActive
              ? "primary.main"
              : "rgba(15, 23, 42, 0.15)",
          bgcolor: isDragActive
            ? "rgba(37, 99, 235, 0.02)"
            : "rgba(15, 23, 42, 0.01)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.22s ease",

          "&:hover": {
            borderColor: activeError ? "error.main" : "primary.main",
            bgcolor: activeError ? "error.50" : "rgba(37, 99, 235, 0.02)",
            "& .upload-overlay": {
              opacity: 1,
            },
          },
        }}
      >
        {activePreview ? (
          <>
            {fileType === "image" ? (
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
            ) : fileType === "video" ? (
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
                <FileText size={48} className="text-slate-500" />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {file ? file.name : "Document Selected"}
                </Typography>
              </Stack>
            )}

            {/* Hover overlay to change image */}
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

            {/* Remove button */}
            <IconButton
              size="small"
              onClick={handleRemove}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                bgcolor: "rgba(255, 255, 255, 0.9)",
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
              {fileType === "image"
                ? "JPG, PNG, GIF, WEBP"
                : fileType === "video"
                  ? "MP4, AVI, MKV, WEBM, MOV"
                  : "PDF, DOC, XLS, PPT, ZIP, TXT"}{" "}
              (Max {maxSizeMB}MB)
            </Typography>
          </Stack>
        )}

        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept={accept || getFileAcceptString(fileType)}
          onChange={handleFileChange}
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
