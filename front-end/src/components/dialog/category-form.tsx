"use client";

import { FormDialog } from "@/components/common/form/form-dialog";
import { FormInput } from "@/components/common/form/form-input";
import type { CategoryRequest, CategoryResponse } from "@/lib/type/courses";
import { Box, Button, IconButton, Typography } from "@mui/material";
import {
  AlignLeft,
  FolderPlus,
  Save,
  Type,
  UploadCloud,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface CategoryFormDialogProps {
  open: boolean;
  editing: CategoryResponse | null;
  saving: boolean;
  onClose: () => void;
  onSave: (form: CategoryRequest, selectedFile: File | null) => Promise<void>;
  onError: (error: Error) => void;
}

export function CategoryFormDialog({
  open,
  editing,
  saving,
  onClose,
  onSave,
  onError,
}: CategoryFormDialogProps) {
  // Form State
  const [form, setForm] = useState<CategoryRequest>({
    name: "",
    description: "",
    thumbnailObjectKey: "",
  });

  // Selected local image file & preview url
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop active status
  const [dragActive, setDragActive] = useState(false);

  // Input validation touched status
  const [touched, setTouched] = useState({
    name: false,
    description: false,
    image: false,
  });

  // Reset form when modal opens or editing changes
  useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          id: editing.id,
          name: editing.name,
          description: editing.description,
          thumbnailObjectKey: editing.thumbnailObjectKey,
        });
        setPreviewUrl(editing.thumbnailUrl || "");
        setSelectedFile(null);
      } else {
        setForm({ name: "", description: "", thumbnailObjectKey: "" });
        setPreviewUrl("");
        setSelectedFile(null);
      }
      setTouched({ name: false, description: false, image: false });
    }
  }, [open, editing]);

  // Form field errors evaluation
  const errors = {
    name: form.name.trim().length < 2 || form.name.length > 50,
    description:
      form.description.trim().length < 6 || form.description.length > 250,
    image: !previewUrl,
  };

  const isFormValid = !errors.name && !errors.description && !errors.image;

  const handleSaveClick = async () => {
    setTouched({ name: true, description: true, image: true });
    if (!isFormValid) return;
    await onSave(form, selectedFile);
  };

  // Drag & drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saving) return;

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
    if (saving) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      onError(
        new Error("Branding asset must be an image file (JPEG, PNG, etc.)"),
      );
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError(new Error("Image size must be less than 5MB"));
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setTouched((prev) => ({ ...prev, image: true }));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
    setForm((prev) => ({ ...prev, thumbnailObjectKey: "" }));
  };

  return (
    <FormDialog
      open={open}
      onClose={onClose}
      onSubmit={handleSaveClick}
      headerIcon={<FolderPlus size={20} />}
      title={editing ? "Update Category" : "Create New Category"}
      submitText="Save"
      submitIcon={editing ? <Save size={16} /> : <FolderPlus size={16} />}
      isSubmitDisabled={saving || !isFormValid}
      maxWidth="sm"
    >
      <Box>
        <FormInput
          label="Category Name"
          placeholder="e.g. Frontend Development"
          value={form.name}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, name: event.target.value }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          error={touched.name && errors.name}
          helperText="Name must be between 2 and 50 characters."
          disabled={saving}
          required
          icon={<Type size={18} />}
          iconPosition="start"
          characterCount={form.name.length}
          maxLength={50}
          slotProps={{
            htmlInput: { maxLength: 50 },
          }}
        />
      </Box>

      <Box>
        <FormInput
          label="Description"
          placeholder="Provide a detailed description of the category's scope and educational focus."
          value={form.description}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, description: event.target.value }))
          }
          onBlur={() => setTouched((prev) => ({ ...prev, description: true }))}
          error={touched.description && errors.description}
          helperText="Description must be between 6 and 250 characters."
          multiline
          minRows={3}
          disabled={saving}
          required
          icon={<AlignLeft size={18} />}
          iconPosition="start"
          characterCount={form.description.length}
          maxLength={250}
          slotProps={{
            htmlInput: { maxLength: 250 },
          }}
        />
      </Box>

      {/* Drag and Drop File Upload Zone */}
      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 600, color: "text.primary" }}
        >
          Category Branding Image *
        </Typography>

        {previewUrl ? (
          <Box
            sx={{
              position: "relative",
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                  : "0 4px 12px rgba(15, 23, 42, 0.04)",
              aspectRatio: "16/9",
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src={previewUrl}
              alt="Branding Preview"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* Actions Overlay */}
            {!saving && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: "rgba(15, 23, 42, 0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  opacity: 0,
                  transition: "opacity 0.2s ease-in-out",
                  "&:hover": { opacity: 1 },
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={<UploadCloud size={16} />}
                  size="small"
                  sx={{
                    bgcolor: "background.paper",
                    color: "text.primary",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  Change Image
                </Button>
                <IconButton
                  onClick={handleRemoveImage}
                  sx={{
                    bgcolor: "#ef4444",
                    color: "white",
                    "&:hover": { bgcolor: "#dc2626" },
                  }}
                >
                  <X size={16} />
                </IconButton>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            onClick={() => !saving && fileInputRef.current?.click()}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            sx={{
              border: "2px dashed",
              borderColor: dragActive
                ? "primary.main"
                : touched.image && errors.image
                  ? "error.main"
                  : "divider",
              borderRadius: 3,
              bgcolor: dragActive
                ? "rgba(37, 99, 235, 0.08)"
                : "action.hover",
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: saving ? "default" : "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                borderColor: saving ? "divider" : "primary.main",
                bgcolor: "action.hover",
              },
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: "50%",
                bgcolor: "rgba(37, 99, 235, 0.08)",
                color: "primary.main",
                mb: 1.5,
              }}
            >
              <UploadCloud size={24} />
            </Box>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "text.primary",
                textAlign: "center",
              }}
            >
              Drag & drop image, or browse local files
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", mt: 0.5, textAlign: "center" }}
            >
              Supports PNG, JPG, JPEG, GIF up to 5MB. Image is required.
            </Typography>
          </Box>
        )}

        {touched.image && errors.image && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mt: 1, ml: 1 }}
          >
            Branding image is required for category structure.
          </Typography>
        )}

        <input
          type="file"
          ref={fileInputRef}
          hidden
          accept="image/*"
          disabled={saving}
          onChange={handleFileChange}
        />
      </Box>
    </FormDialog>
  );
}
