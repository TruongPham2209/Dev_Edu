"use client";

import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { formatBytes } from "@/lib/util/file-utils";
import { Box, Button, Stack, Typography } from "@mui/material";
import { FileText, FolderPlus, UploadCloud, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface UploadGlobalDocumentDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (data: { file: File; title?: string }) => Promise<void> | void;
  loading?: boolean;
}

export function UploadGlobalDocumentDialog({
  open,
  onClose,
  onUpload,
  loading = false,
}: UploadGlobalDocumentDialogProps) {
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when dialog is closed/opened
  useEffect(() => {
    if (open) {
      setUploadTitle("");
      setUploadFile(null);
      setFileError(null);
    }
  }, [open]);

  // File drop / select handler
  const handleFileSelected = (file: File) => {
    setFileError(null);
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setFileError("Only PDF files (.pdf) are supported.");
      setUploadFile(null);
      return;
    }
    const maxSizeBytes = 30 * 1024 * 1024; // 30MB
    if (file.size > maxSizeBytes) {
      setFileError("File size must not exceed 30MB.");
      setUploadFile(null);
      return;
    }
    setUploadFile(file);
    if (!uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async () => {
    if (!uploadFile) {
      setFileError("Please select a PDF file to upload.");
      return;
    }
    await onUpload({
      file: uploadFile,
      title: uploadTitle.trim() || undefined,
    });
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Upload Global Reference Document"
      headerIcon={<FolderPlus size={24} />}
      submitText={loading ? "Uploading..." : "Upload Document"}
      isSubmitDisabled={!uploadFile || loading}
      maxWidth="sm"
    >
      <Stack spacing={2.5}>
        <Box
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleFileSelected(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: "2px dashed",
            borderColor: fileError
              ? "error.main"
              : uploadFile
                ? "success.main"
                : "rgba(15, 23, 42, 0.2)",
            borderRadius: 2,
            p: 3.5,
            textAlign: "center",
            cursor: "pointer",
            bgcolor: uploadFile
              ? "rgba(34, 197, 94, 0.03)"
              : "rgba(15, 23, 42, 0.01)",
            transition: "all 0.2s ease",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: "rgba(37, 99, 235, 0.02)",
            },
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelected(e.target.files[0]);
              }
            }}
          />

          {uploadFile ? (
            <Stack alignItems="center" spacing={1}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "50%",
                  bgcolor: "success.50",
                  color: "success.main",
                }}
              >
                <FileText size={32} />
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {uploadFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatBytes(uploadFile.size)} • PDF Document
              </Typography>
              <Button
                size="small"
                color="error"
                variant="text"
                startIcon={<X size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadFile(null);
                }}
              >
                Remove & Replace
              </Button>
            </Stack>
          ) : (
            <Stack alignItems="center" spacing={1}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "50%",
                  bgcolor: "primary.50",
                  color: "primary.main",
                }}
              >
                <UploadCloud size={28} />
              </Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Click to select PDF or drag & drop file here
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Maximum file size: 30MB (.pdf only)
              </Typography>
            </Stack>
          )}
        </Box>

        {fileError && (
          <Typography variant="caption" color="error.main" sx={{ ml: 1 }}>
            {fileError}
          </Typography>
        )}

        <FormInput
          label="Display Title (Optional)"
          value={uploadTitle}
          onChange={(e) => setUploadTitle(e.target.value)}
          placeholder="E.g., Operating Systems Course Textbook (2026 Edition)"
          helperText="Friendly name for instructors when selecting from the library."
        />
      </Stack>
    </FormDialog>
  );
}