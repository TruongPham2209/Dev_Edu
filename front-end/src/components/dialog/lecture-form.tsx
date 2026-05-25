"use client";

import { FormInput } from "@/components/common/form-input";
import { RichTextEditor } from "@/components/common/rich-text-editor";
import {
  confirmImageUpload,
  getDownloadUrl,
  getPreSignedUploadUrl,
} from "@/lib/api/files";
import { createLecture, updateLecture } from "@/lib/api/lectures";
import type { LectureRequest, LectureResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { FormDialog } from "@/components/common/form-dialog";
import { Box, Typography, IconButton } from "@mui/material";
import { Lock, UploadCloud, X, Type, AlignLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LectureFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
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
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Drag & drop state
  const [dragActive, setDragActive] = useState(false);

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

  // Separate effect to load form and video preview on open or data change
  useEffect(() => {
    if (open) {
      setTouched({ title: false, summary: false, content: false });
      setDragActive(false);
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

        if (initialData.videoObjectKey) {
          loadExistingVideo(initialData.videoObjectKey);
        } else {
          setVideoPreviewUrl(null);
        }
      } else {
        setForm({ courseId, title: "", summary: "", content: "" });
        setVideoPreviewUrl(null);
      }
    }
  }, [open, initialData, courseId]);

  // Separate effect to clean up blob url
  useEffect(() => {
    return () => {
      if (videoPreviewUrl && videoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
    };
  }, [videoPreviewUrl]);

  const loadExistingVideo = async (objectKey: string) => {
    try {
      const res = await getDownloadUrl(objectKey);
      if (res.downloadUrl) {
        setVideoPreviewUrl(res.downloadUrl);
      } else if (res.publicUrl) {
        setVideoPreviewUrl(res.publicUrl);
      }
    } catch (err) {
      console.error("Failed to get video download URL:", err);
    }
  };

  const validateAndSetVideo = (file: File) => {
    if (isVideoLocked) return;

    if (file.size > 200 * 1024 * 1024) {
      handleError(new Error("Video size must be less than 200MB"));
      return;
    }

    if (!file.type.startsWith("video/")) {
      handleError(new Error("Invalid video format (video format required)"));
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    validateAndSetVideo(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isVideoLocked || loading) return;

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
    if (isVideoLocked || loading) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    validateAndSetVideo(file);
  };

  const removeVideo = () => {
    if (isVideoLocked) return;
    setVideoFile(null);
    setVideoPreviewUrl(null);
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
              await confirmImageUpload(key);
            } catch (err) {
              console.warn(`Failed to confirm image: ${key}`, err);
            }
          }),
        );
      }

      // 2. Upload video ONLY in CREATE mode or if not locked
      if (videoFile && !isVideoLocked) {
        const preSignRes = await getPreSignedUploadUrl({
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

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percentComplete =
                Math.round((e.loaded / e.total) * 60) + 30; // 30% to 90%
            }
          };

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
        await updateLecture(payload);
        showSuccess("Lecture updated successfully!");
      } else {
        await createLecture(payload);
        showSuccess("Lecture created successfully!");
      }

      onSaved();
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
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
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
            Course content *
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

        <Box
          sx={{
            p: 3,
            border: "1px dashed",
            borderColor: dragActive ? "primary.main" : "divider",
            borderRadius: 2,
            bgcolor: dragActive ? "rgba(37, 99, 235, 0.04)" : "grey.50",
            transition: "all 0.2s ease-in-out",
            opacity: loading ? 0.7 : 1,
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
            Video lecture {isVideoLocked && "(Locked)"}
          </Typography>

          {videoPreviewUrl ? (
            <Box
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: "black",
                aspectRatio: "16/9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <video
                src={videoPreviewUrl}
                controls
                style={{ width: "100%", maxHeight: "100%" }}
              />
              {!loading && !isVideoLocked && (
                <IconButton
                  onClick={removeVideo}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                >
                  <X size={20} />
                </IconButton>
              )}
              {isVideoLocked && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    bgcolor: "rgba(245, 158, 11, 0.95)",
                    color: "white",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <Lock size={14} />
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Locked
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 4,
                cursor: loading || isVideoLocked ? "default" : "pointer",
              }}
              onClick={() =>
                !loading && !isVideoLocked && fileInputRef.current?.click()
              }
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: "50%",
                  bgcolor: isVideoLocked
                    ? "rgba(245, 158, 11, 0.08)"
                    : "rgba(37, 99, 235, 0.08)",
                  mb: 2,
                }}
              >
                {isVideoLocked ? (
                  <Lock size={32} className="text-amber-500" />
                ) : (
                  <UploadCloud size={32} className="text-blue-500" />
                )}
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {isVideoLocked
                  ? "Cannot upload video"
                  : "Drag and drop or click to upload video"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  mt: 1,
                  textAlign: "center",
                  px: 2,
                }}
              >
                {isVideoLocked
                  ? "Cannot add new video when updating a lecture. Please create a new lecture if you want to upload a video."
                  : "Maximum file size: 200MB. Supported formats: MP4, WebM"}
              </Typography>
            </Box>
          )}

          {isVideoLocked && videoPreviewUrl && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 2,
                p: 1.5,
                bgcolor: "rgba(245, 158, 11, 0.08)",
                color: "rgba(180, 83, 9, 1)",
                borderRadius: 1.5,
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <Lock size={16} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Cannot change or delete the video at the moment
              </Typography>
            </Box>
          )}

          <input
            type="file"
            ref={fileInputRef}
            hidden
            accept="video/*"
            onChange={handleVideoSelect}
            disabled={loading || isVideoLocked}
          />
        </Box>
      </Box>
    </FormDialog>
  );
}
