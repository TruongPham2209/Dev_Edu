"use client";

import { FileUpload } from "@/components/common/form/file-upload";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { Stack } from "@mui/material";
import { FolderPlus } from "lucide-react";
import { useEffect, useState } from "react";

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

  // Reset state when dialog is closed/opened
  useEffect(() => {
    if (open) {
      setUploadTitle("");
      setUploadFile(null);
    }
  }, [open]);

  const handleFileChange = (file: File | null) => {
    setUploadFile(file);
    if (file && !uploadTitle.trim()) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async () => {
    if (!uploadFile) return;
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
        <FileUpload
          file={uploadFile}
          onChange={handleFileChange}
          fileExtensions={[".pdf"]}
          maxSizeMB={30}
          height={180}
        />

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