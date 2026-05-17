"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  IconButton,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";
import { getLecturesByCourse, deleteLecture } from "@/lib/api/lectures";
import type { LectureResponse } from "@/lib/api/types";
import { EmptyState } from "@/components/common/empty-state";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Plus,
  Video,
  Pencil,
  Trash2,
  ChevronRight,
  LayoutList,
} from "lucide-react";
import { LectureModal } from "./lecture-modal";
import Link from "next/link";

export const LecturesTab = ({ courseId }: { courseId: string }) => {
  const { handleError, showSuccess } = useApiWithToast();
  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<
    LectureResponse | undefined
  >(undefined);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getLecturesByCourse(courseId);
      const unique = Array.from(new Map(res.map((l) => [l.id, l])).values());
      setLectures(unique);
    } catch (err) {
      handleError(err, "Failed to load lectures");
    } finally {
      setLoading(false);
    }
  }, [courseId, handleError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingLecture(undefined);
    setModalOpen(true);
  };

  const handleEdit = (lecture: LectureResponse) => {
    setEditingLecture(lecture);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteLecture(confirmDelete);
      showSuccess("Lecture deleted successfully");
      loadData();
    } catch (err) {
      handleError(err, "Failed to delete lecture");
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading) {
    return (
      <Card sx={{ p: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LayoutList className="text-blue-500" size={24} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Course Curriculum
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={handleCreate}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: "none",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
            }}
          >
            Create Lecture
          </Button>
        </Box>

        {lectures.length === 0 ? (
          <EmptyState
            title="No lectures yet"
            subtitle="Start building your course by adding your first lecture."
            actionLabel="Add Lecture"
            onAction={handleCreate}
          />
        ) : (
          <Stack spacing={2}>
            {lectures.map((lecture, index) => (
              <Box
                key={lecture.id}
                sx={{
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  p: 1,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    borderColor: "primary.main",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "grey.50",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "text.secondary",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, fontSize: "1.05rem" }}>
                        {lecture.title}
                      </Typography>
                      {lecture.videoObjectKey && (
                        <Chip
                          size="small"
                          icon={<Video size={12} />}
                          label="Video"
                          color="primary"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {lecture.summary || "No summary provided"}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: { xs: "100%", sm: "auto" },
                    justifyContent: { xs: "flex-end", sm: "initial" },
                  }}
                >
                  <Button
                    size="small"
                    component={Link}
                    href={`/lecturer/courses/${courseId}/lectures/${lecture.id}`}
                    endIcon={<ChevronRight size={16} />}
                    sx={{ fontWeight: 600 }}
                  >
                    Manage
                  </Button>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(lecture)}
                    color="primary"
                    sx={{ bgcolor: "primary.50" }}
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setConfirmDelete(lecture.id)}
                    sx={{ bgcolor: "error.50" }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>

      <LectureModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          loadData();
        }}
        courseId={courseId}
        initialData={editingLecture}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete Lecture"
        description="Are you sure you want to delete this lecture? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </Card>
  );
};
