"use client";

import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { FileUpload } from "@/components/common/form/file-upload";
import { usePreSignedUploadUrlMutation } from "@/lib/api/files";
import { useCreateMaterialMutation } from "@/lib/api/lectures";
import type { MaterialResponse } from "@/lib/type/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { Type, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

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
