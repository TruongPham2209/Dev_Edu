"use client";

import { FormInput } from "@/components/common/form-input";
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { FolderPlus, Type } from "lucide-react";
import { RichTextEditor } from "@/components/common/rich-text-editor";
import { createAssignment } from "@/lib/api/assignments";
import type { AssignmentResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { FormDialog } from "@/components/common/form-dialog";

interface AssignmentFormDialogProps {
  open: boolean;
  onClose: () => void;
  lectureId: string;
  onSuccess: (assignment: AssignmentResponse) => void;
}

export function AssignmentFormDialog({
  open,
  onClose,
  lectureId,
  onSuccess,
}: AssignmentFormDialogProps) {
  const { handleError, showSuccess } = useApiWithToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({ title: false, description: false });

  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setTouched({ title: false, description: false });
      setSubmitting(false);
    }
  }, [open]);

  // Plain text length helper to enforce character limit
  const getPlainTextLength = (html: string) => {
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, "").trim().length;
    }
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return (tempDiv.textContent || tempDiv.innerText || "").trim().length;
  };

  const plainTextLength = getPlainTextLength(description);
  const isDescriptionOverLimit = plainTextLength > 500;
  const isDescriptionEmpty = plainTextLength === 0;

  const isTitleEmpty = !title.trim();

  const isFormValid =
    !isTitleEmpty && !isDescriptionEmpty && !isDescriptionOverLimit;

  const handleCloseDialog = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    setTouched({ title: true, description: true });

    if (!isFormValid) return;

    setSubmitting(true);

    try {
      const newAssignment = await createAssignment({
        lectureId,
        title: title.trim(),
        description: description, // Pass the HTML formatted content
      });

      showSuccess("Đã thêm bài tập thành công");
      onSuccess(newAssignment);
      onClose();
    } catch (err) {
      handleError(err, "Không thể tạo bài tập");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormDialog
      open={open}
      onClose={handleCloseDialog}
      onSubmit={handleSubmit}
      headerIcon={<FolderPlus size={20} />}
      title="Tạo bài tập mới"
      submitText="Tạo bài tập"
      isSubmitDisabled={!isFormValid}
    >
      <FormInput
        label="Tiêu đề bài tập *"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (e.target.value.trim()) {
            setTouched((prev) => ({ ...prev, title: false }));
          }
        }}
        onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
        error={touched.title && isTitleEmpty}
        helperText="Vui lòng nhập tiêu đề bài tập"
        disabled={submitting}
        icon={<Type size={18} />}
        iconPosition="start"
        placeholder="Bài tập tuần 1"
      />

      <Box>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 700, color: "#1e293b" }}
        >
          Hướng dẫn làm bài *
        </Typography>
        <Box
          sx={{
            opacity: submitting ? 0.6 : 1,
            pointerEvents: submitting ? "none" : "auto",
            border:
              touched.description &&
              (isDescriptionEmpty || isDescriptionOverLimit)
                ? "1px solid"
                : "none",
            borderColor: "error.main",
            borderRadius: 3,
          }}
        >
          <RichTextEditor
            value={description}
            onChange={(val) => {
              setDescription(val);
              setTouched((prev) => ({ ...prev, description: true }));
            }}
            disableImage={true}
            minHeight={200}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 0.75,
            px: 0.5,
          }}
        >
          <Box>
            {touched.description && isDescriptionEmpty && (
              <Typography
                variant="caption"
                color="error"
                sx={{ fontWeight: 500 }}
              >
                Vui lòng nhập nội dung hướng dẫn làm bài
              </Typography>
            )}
            {touched.description && isDescriptionOverLimit && (
              <Typography
                variant="caption"
                color="error"
                sx={{ fontWeight: 500 }}
              >
                Nội dung vượt quá giới hạn 500 ký tự cho phép
              </Typography>
            )}
          </Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 600,
              color: isDescriptionOverLimit ? "error.main" : "text.secondary",
            }}
          >
            {plainTextLength} / 500 ký tự
          </Typography>
        </Box>
      </Box>
    </FormDialog>
  );
}
