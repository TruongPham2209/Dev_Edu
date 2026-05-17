"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { RichTextEditor } from "@/components/common/rich-text-editor";
import {
  createAssignment,
  deleteAssignment,
  getAssignments,
} from "@/lib/api/assignments";
import type { AssignmentResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/date-utils";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Calendar,
  ChevronRight,
  ClipboardList,
  ClipboardPen,
  FileText,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AssignmentsTabProps {
  lectureId: string;
  courseId: string;
  onCountChange?: (count: number) => void;
}

export function AssignmentsTab({
  lectureId,
  courseId,
  onCountChange,
}: AssignmentsTabProps) {
  const theme = useTheme();
  const { handleError, showSuccess } = useApiWithToast();

  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState({ title: false, description: false });

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exitingIds, setExitingIds] = useState<string[]>([]);

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

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await getAssignments(lectureId);
      setAssignments(data);
    } catch (err) {
      handleError(err, "Không thể tải danh sách bài tập");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, [lectureId]);

  useEffect(() => {
    onCountChange?.(assignments.length);
  }, [assignments, onCountChange]);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteAssignment(deletingId);
      showSuccess("Đã xóa bài tập");

      // Smooth exit animation
      setExitingIds((prev) => [...prev, deletingId]);
    } catch (err) {
      handleError(err, "Không thể xóa bài tập");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnimationExited = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setExitingIds((prev) => prev.filter((exId) => exId !== id));
  };

  const handleOpenDialog = () => {
    setTitle("");
    setDescription("");
    setTouched({ title: false, description: false });
    setSubmitting(false);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
  };

  const handleSubmit = async () => {
    setTouched({ title: true, description: true });

    if (!isFormValid) return;

    setSubmitting(true);

    try {
      const newAssignment = await createAssignment({
        lectureId,
        title: title.trim(),
        description: description, // Pass the HTML formatting content
      });

      showSuccess("Đã thêm bài tập thành công");

      // ALWAYS append newly created assignment to the TOP of the list
      setAssignments((prev) => [newAssignment, ...prev]);

      setDialogOpen(false);
    } catch (err) {
      handleError(err, "Không thể tạo bài tập");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Stack spacing={2} sx={{ mt: 1 }}>
        {Array.from({ length: 2 }).map((_, idx) => (
          <Card
            key={idx}
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "divider",
              p: 2.5,
            }}
          >
            <Box
              sx={{
                width: "30%",
                height: 22,
                bgcolor: "grey.100",
                borderRadius: 1,
                mb: 1.5,
              }}
            />
            <Box
              sx={{
                width: "70%",
                height: 16,
                bgcolor: "grey.100",
                borderRadius: 0.5,
                mb: 1,
              }}
            />
            <Box
              sx={{
                width: "50%",
                height: 16,
                bgcolor: "grey.100",
                borderRadius: 0.5,
              }}
            />
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Bài tập tự luận
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Quản lý các bài tập thực hành, câu hỏi tự luận để đánh giá năng lực
            học viên.
          </Typography>
        </Box>
        <Tooltip title="Thêm bài tập" arrow>
          <IconButton
            onClick={handleOpenDialog}
            sx={{
              width: 42,
              height: 42,
              borderRadius: 3,
              bgcolor: "primary.main",
              color: "white",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.18)",
              transition: "all 0.2s ease",

              "&:hover": {
                bgcolor: "primary.dark",
                transform: "translateY(-1px) scale(1.03)",
                boxShadow: "0 6px 18px rgba(25, 118, 210, 0.28)",
              },
            }}
          >
            <ClipboardPen size={20} strokeWidth={2.2} />
          </IconButton>
        </Tooltip>
      </Box>

      {assignments.length === 0 ? (
        <EmptyState
          title="Chưa có bài tập nào"
          subtitle="Tạo bài tập tự luận để học sinh thực hành và nhận phản hồi từ bạn."
          icon={<ClipboardList size={40} />}
        />
      ) : (
        <Stack spacing={2}>
          {assignments.map((assignment) => {
            const isExiting = exitingIds.includes(assignment.id);

            return (
              <Collapse
                key={assignment.id}
                in={!isExiting}
                timeout={300}
                onExited={() => handleAnimationExited(assignment.id)}
              >
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 3,
                    borderColor: "divider",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.light",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.03)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 3,
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center", mb: 1 }}
                        >
                          <Box
                            sx={{
                              p: 0.75,
                              borderRadius: 1,
                              bgcolor: "rgba(37, 99, 235, 0.06)",
                              color: "primary.main",
                              display: "flex",
                              flexShrink: 0,
                            }}
                          >
                            <FileText size={18} />
                          </Box>
                          <Typography
                            variant="subtitle1"
                            sx={{
                              fontWeight: 750,
                              color: "#1e293b",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {assignment.title}
                          </Typography>

                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{
                              alignItems: "center",
                              color: "text.secondary",
                              mx: 1,
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1,
                              px: 1,
                              py: 0.5,
                            }}
                          >
                            <Calendar size={16} />
                            <Typography variant="caption">
                              Tạo ngày:{" "}
                              {formatServerDate(
                                assignment.createdAt,
                                "datetime",
                              )}
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Description render */}
                        <Box
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.875rem",
                            lineHeight: 1.6,
                            mb: 2,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            "& p": { m: 0 },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: assignment.description,
                          }}
                        />

                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ alignItems: "center", flexWrap: "wrap" }}
                        ></Stack>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexShrink: 0, alignItems: "center" }}
                      >
                        <Button
                          component={Link}
                          href={`/lecturer/courses/${courseId}/lectures/${lectureId}/assignments/${assignment.id}`}
                          variant="outlined"
                          size="small"
                          endIcon={<ChevronRight size={14} />}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                            px: 2,
                            py: 0.75,
                            borderWidth: 1,
                            borderColor: "divider",
                            color: "text.primary",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: "rgba(37, 99, 235, 0.02)",
                            },
                          }}
                        >
                          Chi tiết
                        </Button>
                        <IconButton
                          onClick={() => handleDeleteClick(assignment.id)}
                          size="small"
                          sx={{
                            color: "error.main",
                            bgcolor: "rgba(239, 68, 68, 0.04)",
                            "&:hover": { bgcolor: "rgba(239, 68, 68, 0.1)" },
                            borderRadius: 2,
                            p: 1,
                          }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              </Collapse>
            );
          })}
        </Stack>
      )}

      {/* Add/Create Assignment Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 3, p: 1 },
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pb: 1,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Tạo bài tập mới
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
            disabled={submitting}
            size="small"
          >
            <X size={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}
        >
          <TextField
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
            helperText={
              touched.title && isTitleEmpty
                ? "Vui lòng nhập tiêu đề bài tập"
                : ""
            }
            fullWidth
            disabled={submitting}
            variant="outlined"
            slotProps={{
              input: {
                sx: { borderRadius: 2.5 },
              },
            }}
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
                disableImage={true} // Strict requirement: DISABLE image upload/insertion
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
                  color: isDescriptionOverLimit
                    ? "error.main"
                    : "text.secondary",
                }}
              >
                {plainTextLength} / 500 ký tự
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={submitting}
            color="inherit"
            sx={{ fontWeight: 600 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !isFormValid}
            startIcon={
              submitting ? <Loader2 size={16} className="animate-spin" /> : null
            }
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 1,
              fontWeight: 700,
              textTransform: "none",
              minWidth: 120,
            }}
          >
            {submitting ? "Đang lưu..." : "Tạo bài tập"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Xóa bài tập?"
        description="Toàn bộ bài làm và phản hồi của học sinh cho bài tập này sẽ bị xóa. Hành động không thể hoàn tác."
        confirmLabel="Xóa bài tập"
        cancelLabel="Hủy"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Box>
  );
}
