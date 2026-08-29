"use client";

import { FileUpload } from "@/components/common/form/file-upload";
import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import { RichTextEditor } from "@/components/common/form/rich-text-editor";
import { ImagePreview } from "@/components/common/image-preview";
import { useConfirmImageUploadMutation } from "@/lib/api/files";
import { PostRequest, PostResponse } from "@/lib/type/forums";
import { Box, Button, FormHelperText, Typography } from "@mui/material";
import { FileText, Plus, Save } from "lucide-react";
import { useMemo, useState } from "react";

interface PostFormDialogProps {
  open: boolean;
  initialValue: PostRequest;
  editingPost?: PostResponse | null;
  saving?: boolean;
  onClose: () => void;
  onSave: (
    payload: PostRequest,
    selectedFile: File | null,
  ) => Promise<void>;
}

export function PostFormDialog({
  open,
  initialValue,
  editingPost,
  saving = false,
  onClose,
  onSave,
}: PostFormDialogProps) {
  const [form, setForm] = useState<PostRequest>(initialValue);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [touched, setTouched] = useState({
    title: false,
    shortDescription: false,
    content: false,
    thumbnail: false,
  });
  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<
    { url: string; objectKey: string }[]
  >([]);

  const { mutateAsync: confirmImageUploadMutate } =
    useConfirmImageUploadMutation();

  const previewSrc = useMemo(() => {
    if (selectedFile) return URL.createObjectURL(selectedFile);
    return editingPost?.thumbUrl || undefined;
  }, [selectedFile, editingPost?.thumbUrl]);

  const [prevProps, setPrevProps] = useState({ open, initialValue });

  if (prevProps.open !== open || prevProps.initialValue !== initialValue) {
    setPrevProps({ open, initialValue });
    if (open) {
      setForm(initialValue);
      setSelectedFile(null);
      setTouched({
        title: false,
        shortDescription: false,
        content: false,
        thumbnail: false,
      });
      setUploadedImages([]);
    }
  }

  const errors = useMemo(() => {
    const isUpdate = Boolean(initialValue.postId);
    const strippedContent = form.content.replace(/<[^>]*>/g, "").trim();

    return {
      title: form.title.trim().length === 0 || form.title.trim().length > 255,
      shortDescription:
        form.shortDescription.trim().length === 0 ||
        form.shortDescription.trim().length > 500,
      content: strippedContent.length === 0,
      thumbnail: !isUpdate && !selectedFile && !form.thumbObjectKey,
    };
  }, [form, selectedFile, initialValue.postId]);

  const isValid = useMemo(() => !Object.values(errors).some(Boolean), [errors]);

  const handleSave = async () => {
    setTouched({
      title: true,
      shortDescription: true,
      content: true,
      thumbnail: true,
    });
    if (!isValid) return;

    // Process image persistence confirmations
    const parser = new DOMParser();
    const doc = parser.parseFromString(form.content || "", "text/html");
    const imgs = doc.querySelectorAll("img");
    const activeUrls = Array.from(imgs)
      .map((img) => img.getAttribute("src"))
      .filter(Boolean) as string[];

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

    const payload: PostRequest = {
      postId: form.postId,
      thumbObjectKey: form.thumbObjectKey,
      title: form.title.trim(),
      shortDescription: form.shortDescription.trim(),
      content: form.content.trim(),
    };
    await onSave(payload, selectedFile);
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSave}
      title={editingPost ? "Edit Post" : "Create Post"}
      headerIcon={<FileText size={20} />}
      submitText={editingPost ? "Save Changes" : "Create Post"}
      submitIcon={editingPost ? <Save size={16} /> : <Plus size={16} />}
      isSubmitDisabled={!isValid || saving}
      maxWidth="md"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
          pointerEvents: saving ? "none" : "auto",
          opacity: saving ? 0.7 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        <FormInput
          label="Title *"
          placeholder="Enter post title"
          value={form.title}
          disabled={saving}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              title: event.target.value,
            }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
          error={touched.title && errors.title}
          helperText="Title is required and must be at most 255 characters"
        />

        <FormInput
          label="Short description *"
          placeholder="Enter short description"
          value={form.shortDescription}
          disabled={saving}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              shortDescription: event.target.value,
            }))
          }
          onBlur={() =>
            setTouched((prev) => ({ ...prev, shortDescription: true }))
          }
          error={touched.shortDescription && errors.shortDescription}
          helperText="Short description is required and must be at most 500 characters"
          multiline
          minRows={2}
        />

        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                fontSize: { xs: "0.85rem", sm: "0.875rem" },
              }}
            >
              Thumbnail Image *
            </Typography>
            {previewSrc && (
              <Button
                size="small"
                variant="text"
                onClick={() => setPreviewOpen(true)}
                sx={{ fontSize: { xs: "0.775rem", sm: "0.85rem" } }}
              >
                Preview Image
              </Button>
            )}
          </Box>
          <FileUpload
            value={editingPost?.thumbUrl || undefined}
            file={selectedFile}
            onChange={(file) => {
              setSelectedFile(file);
              setTouched((prev) => ({ ...prev, thumbnail: true }));
            }}
            error={touched.thumbnail && errors.thumbnail}
            helperText={
              touched.thumbnail && errors.thumbnail
                ? "Thumbnail is required"
                : ""
            }
            height={180}
            accept="image/*"
          />
          <ImagePreview
            open={previewOpen}
            src={previewSrc}
            onClose={() => setPreviewOpen(false)}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              color: "text.primary",
              fontSize: { xs: "0.85rem", sm: "0.875rem" },
            }}
          >
            Content *
          </Typography>
          <RichTextEditor
            value={form.content}
            onChange={(html) => {
              setForm((prev) => ({ ...prev, content: html }));
              setTouched((prev) => ({ ...prev, content: true }));
            }}
            onImageUpload={(url, objectKey) => {
              setUploadedImages((prev) => [...prev, { url, objectKey }]);
            }}
            minHeight={160}
            error={touched.content && errors.content}
          />
          {touched.content && errors.content && (
            <FormHelperText error sx={{ mx: 1.5, mt: 0.5 }}>
              Content is required
            </FormHelperText>
          )}
        </Box>
      </Box>
    </FormDialog>
  );
}
