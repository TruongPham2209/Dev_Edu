"use client";

import { FileUpload } from "@/components/common/form/file-upload";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { RichTextEditor } from "@/components/common/form/rich-text-editor";
import {
  useConfirmImageUploadMutation,
  useDownloadUrlQuery,
  usePreSignedUploadUrlMutation,
} from "@/lib/api/files";
import {
  useCreateLectureMutation,
  useUpdateLectureMutation,
} from "@/lib/api/lectures";
import type { LectureRequest, LectureResponse } from "@/lib/type/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { alpha, Box, Typography } from "@mui/material";
import { AlignLeft, Lock, Type } from "lucide-react";
import { useEffect, useState } from "react";

interface LectureFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void>;
  courseId: string;
  initialData?: LectureResponse;
}

export function LectureFormDialog({
  open,
  onClose,
  onSaved,
  courseId,
  initialData,
}: LectureFormDialogProps) {
  const { handleError, showSuccess } = useApiWithToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<LectureRequest>({
    courseId,
    title: "",
    summary: "",
    content: "",
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);

  // Track exact S3/R2 object keys mapped to their editor URLs during the current session
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; objectKey: string }[]
  >([]);

  // Validation state
  const [touched, setTouched] = useState({
    title: false,
    summary: false,
    content: false,
  });

  // Compute locked state for video: in update mode, video operations are locked.
  const isVideoLocked = Boolean(initialData);

  // Real-time reactive validation
  const titleClean = form.title ? form.title.trim() : "";
  const summaryClean = form.summary ? form.summary.trim() : "";
  const contentTextClean = form.content
    ? form.content.replace(/<[^>]*>/g, "").trim()
    : "";

  const isTitleInvalid = !titleClean;
  const isSummaryInvalid = !summaryClean;
  const isContentInvalid = !form.content || !contentTextClean;

  const isFormValid = !isTitleInvalid && !isSummaryInvalid && !isContentInvalid;

  // React Query Hooks
  const { mutateAsync: preSignMutate } = usePreSignedUploadUrlMutation();
  const { mutateAsync: createLectureMutate } = useCreateLectureMutation();
  const { mutateAsync: updateLectureMutate } = useUpdateLectureMutation();
  const { mutateAsync: confirmImageUploadMutate } =
    useConfirmImageUploadMutation();

  const videoObjectKey = initialData?.videoObjectKey;
  const { data: downloadData } = useDownloadUrlQuery(videoObjectKey || "", {
    enabled: open && !!videoObjectKey,
  });

  // Separate effect to load form on open or data change
  useEffect(() => {
    if (open) {
      setTouched({ title: false, summary: false, content: false });
      setVideoFile(null);
      setUploadedImages([]);

      if (initialData) {
        setForm({
          id: initialData.id,
          courseId,
          title: initialData.title,
          summary: initialData.summary,
          content: initialData.content || "",
          videoObjectKey: initialData.videoObjectKey,
        });
      } else {
        setForm({ courseId, title: "", summary: "", content: "" });
      }
    }
  }, [open, initialData, courseId]);

  const handleSave = async () => {
    // Mark all as touched on submit
    setTouched({ title: true, summary: true, content: true });

    if (!isFormValid) {
      handleError(
        new Error("Please resolve all validation errors before saving."),
      );
      return;
    }

    try {
      setLoading(true);
      const payload = { ...form };

      // 1. Process image persistence confirmations using the EXACT, UNCHANGED objectKey returned from presign
      const parser = new DOMParser();
      const doc = parser.parseFromString(form.content || "", "text/html");
      const imgs = doc.querySelectorAll("img");
      const activeUrls = Array.from(imgs)
        .map((img) => img.getAttribute("src"))
        .filter(Boolean) as string[];

      // Filter uploaded images from current session that are still active in the editor HTML
      const keysToConfirm = uploadedImages
        .filter((item) => {
          const decodedItemUrl = decodeURIComponent(item.url);
          return activeUrls.some((activeUrl) => {
            const decodedActiveUrl = decodeURIComponent(activeUrl);
            return (
              decodedActiveUrl.includes(decodedItemUrl) ||
              decodedItemUrl.includes(decodedActiveUrl)
            );
          });
        })
        .map((item) => item.objectKey);

      // Unique keys to prevent duplicate confirmations
      const uniqueKeys = Array.from(new Set(keysToConfirm));

      if (uniqueKeys.length > 0) {
        await Promise.all(
          uniqueKeys.map(async (key) => {
            try {
              await confirmImageUploadMutate(key);
            } catch (err) {
              console.warn(`Failed to confirm image: ${key}`, err);
            }
          }),
        );
      }

      // 2. Upload video ONLY in CREATE mode or if not locked
      if (videoFile && !isVideoLocked) {
        const preSignRes = await preSignMutate({
          fileName: videoFile.name,
          contentType: videoFile.type,
          fileSize: videoFile.size,
          isPublic: false,
        });

        if (!preSignRes.uploadUrl || !preSignRes.objectKey) {
          throw new Error("Failed to get upload URL");
        }

        // Custom upload with progress tracking
        await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", preSignRes.uploadUrl!, true);
          xhr.setRequestHeader("Content-Type", videoFile.type);

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(true);
            } else {
              reject(new Error("Upload failed"));
            }
          };

          xhr.onerror = () => reject(new Error("Network error during upload"));
          xhr.send(videoFile);
        });

        payload.videoObjectKey = preSignRes.objectKey;
      }

      // 3. Save lecture
      if (payload.id) {
        await updateLectureMutate(payload);
        showSuccess("Lecture updated successfully!");
      } else {
        await createLectureMutate(payload);
        showSuccess("Lecture created successfully!");
      }

      await onSaved();
      onClose();
    } catch (err) {
      handleError(err, "Failed to save lecture");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={initialData ? "Edit lecture" : "Create new lecture"}
      headerIcon={<AlignLeft size={20} />}
      submitText={initialData ? "Update lecture" : "Create lecture"}
      isSubmitDisabled={loading || !isFormValid}
      maxWidth="md"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          pt: 2,
          pointerEvents: loading ? "none" : "auto",
          opacity: loading ? 0.7 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <FormInput
          label="Lecture title *"
          value={form.title}
          placeholder="Lecture 1: Setting up the environment"
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
          disabled={loading}
          required
          error={touched.title && isTitleInvalid}
          helperText="Title is required"
          icon={<Type size={18} />}
          iconPosition="start"
        />
        <FormInput
          label="Lecture summary *"
          placeholder="Learn and install programming tools ..."
          value={form.summary}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, summary: e.target.value }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, summary: true }))}
          disabled={loading}
          required
          error={touched.summary && isSummaryInvalid}
          helperText="Summary is required"
          icon={<AlignLeft size={18} />}
          iconPosition="start"
        />

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Lecture content *
          </Typography>
          <Box
            sx={{
              opacity: loading ? 0.6 : 1,
              pointerEvents: loading ? "none" : "auto",
              border:
                touched.content && isContentInvalid ? "1px solid" : "none",
              borderColor: "error.main",
              borderRadius: 2,
            }}
          >
            <RichTextEditor
              value={form.content || ""}
              onChange={(val) => {
                setForm((prev) => ({ ...prev, content: val }));
                setTouched((prev) => ({ ...prev, content: true }));
              }}
              onImageUpload={(url, objectKey) => {
                setUploadedImages((prev) => [...prev, { url, objectKey }]);
              }}
              minHeight={250}
            />
          </Box>
          {touched.content && isContentInvalid && (
            <Typography
              variant="caption"
              color="error"
              sx={{ mt: 0.5, display: "block" }}
            >
              Course content is required
            </Typography>
          )}
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Video lecture {isVideoLocked && "(Locked)"}
          </Typography>

          <FileUpload
            value={downloadData?.downloadUrl || downloadData?.publicUrl || null}
            file={videoFile}
            onChange={(file) => {
              if (isVideoLocked) return;
              setVideoFile(file);
            }}
            onClear={() => {
              if (isVideoLocked) return;
              setVideoFile(null);
            }}
            fileType="video"
            maxSizeMB={200}
            height={240}
            disabled={loading || isVideoLocked}
            helperText={
              isVideoLocked
                ? "Cannot add or change video when updating a lecture. Please create a new lecture if you want to upload a new video."
                : "Maximum file size: 200MB. Supported formats: MP4, AVI, MKV, WEBM, MOV"
            }
          />

          {isVideoLocked && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1.5,
                p: 1.5,
                bgcolor: (theme) =>
                  alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.15 : 0.08,
                  ),
                color: "warning.main",
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: (theme) =>
                  alpha(theme.palette.warning.main, 0.2),
              }}
            >
              <Lock size={16} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Cannot change or delete the video at the moment
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </FormDialog>
  );
}
