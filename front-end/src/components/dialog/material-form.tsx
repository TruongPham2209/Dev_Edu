"use client";

import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { FileUpload } from "@/components/common/form/file-upload";
import { useCreateMaterialMutation } from "@/lib/api/lectures";
import type { MaterialResponse } from "@/lib/type/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { uploadFileWithStrategy } from "@/lib/util/chunked-upload";
import { Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { Type, UploadCloud } from "lucide-react";
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
  const abortControllerRef = useRef<AbortController | null>(null);

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

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setUploading(false);
    setUploadProgress(0);
  };

  const handleCloseDialog = () => {
    if (uploading) {
      handleCancelUpload();
    }
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
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // 1. Upload file using Unified Single / Chunked Upload strategy
      const uploadRes = await uploadFileWithStrategy(file!, {
        isPublic: false,
        signal: abortController.signal,
        onProgress: (percent) => {
          setUploadProgress(percent);
        },
      });

      if (!uploadRes.objectKey) {
        throw new Error("Could not obtain file object key");
      }

      setUploadProgress(95);

      // 2. Call Material Creation API
      const newMaterial = await createMaterialMutate({
        lectureId,
        title: title.trim(),
        fileObjectKey: uploadRes.objectKey,
      });

      setUploadProgress(100);
      showSuccess("Added material successfully");

      onSuccess(newMaterial);
      onClose();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      handleError(err, "Failed to upload material");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={handleCloseDialog}
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

        <FileUpload
          file={file}
          onChange={(selectedFile) => {
            setFile(selectedFile);
            if (selectedFile) {
              setFileError("");
              if (!title.trim()) {
                const nameWithoutExt = selectedFile.name.substring(
                  0,
                  selectedFile.name.lastIndexOf("."),
                );
                setTitle(nameWithoutExt || selectedFile.name);
                setTitleError("");
              }
            }
          }}
          fileType="document"
          maxSizeMB={100}
          error={Boolean(fileError)}
          helperText={fileError}
        />

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
              <Stack
                sx={{
                  flexDirection: "row",
                  gap: 1,
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "primary.main" }}
                >
                  {uploadProgress}%
                </Typography>
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  onClick={handleCancelUpload}
                  sx={{ textTransform: "none", p: 0, minWidth: "auto", fontSize: "0.75rem" }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{
                height: 6,
                borderRadius: 3,
                bgcolor: "action.hover",
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
