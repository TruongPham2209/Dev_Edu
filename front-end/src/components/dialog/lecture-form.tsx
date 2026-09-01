"use client";

import { FileUpload } from "@/components/common/form/file-upload";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { RichTextEditor } from "@/components/common/form/rich-text-editor";
import {
  useConfirmImageUploadMutation,
  useDownloadUrlQuery,
} from "@/lib/api/files";
import {
  useCreateLectureMutation,
  useUpdateLectureMutation,
} from "@/lib/api/lectures";
import type { LectureRequest, LectureResponse } from "@/lib/type/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { uploadFileWithStrategy } from "@/lib/util/chunked-upload";
import { alpha, Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import { AlignLeft, Lock, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      setUploadProgress(0);
      setUploadStage(null);

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

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    setUploadStage(null);
    setUploadProgress(0);
  };

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
        setUploadStage("Preparing video upload...");
        setUploadProgress(0);
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const uploadRes = await uploadFileWithStrategy(videoFile, {
          isPublic: false,
          signal: abortController.signal,
          onProgress: (percent, currentPart, totalParts) => {
            setUploadProgress(percent);
            if (totalParts > 1) {
              setUploadStage(
                `Uploading video: part ${currentPart}/${totalParts} (${percent}%)`,
              );
            } else {
              setUploadStage(`Uploading video (${percent}%)`);
            }
          },
        });

        payload.videoObjectKey = uploadRes.objectKey;
        setUploadStage(null);
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
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      handleError(err, "Failed to save lecture");
    } finally {
      setLoading(false);
      setUploadStage(null);
      setUploadProgress(0);
      abortControllerRef.current = null;
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

          {loading && uploadStage && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Stack
                sx={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {uploadStage}
                </Typography>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={handleCancelUpload}
                  sx={{ textTransform: "none", py: 0.25, px: 1.5 }}
                >
                  Cancel Upload
                </Button>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          )}

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
