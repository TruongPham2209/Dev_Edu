"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { LectureFormDialog } from "@/components/dialog/lecture-form";
import { ListSkeleton } from "@/components/skeleton";
import {
  useDeleteLectureMutation,
  useLecturesByCourseQuery,
} from "@/lib/api/lectures";
import type { LectureResponse } from "@/lib/type/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import {
  FilePlus,
  LayoutList,
  Pencil,
  Settings,
  Trash2,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export const LecturesTab = ({ courseId }: { courseId: string }) => {
  const router = useRouter();
  const { handleError, showSuccess } = useApiWithToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<
    LectureResponse | undefined
  >(undefined);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const {
    data: lecturesData = [],
    isLoading: loading,
    refetch,
  } = useLecturesByCourseQuery(courseId);

  const lectures = useMemo(() => {
    return Array.from(new Map(lecturesData.map((l) => [l.id, l])).values());
  }, [lecturesData]);

  const handleCreate = () => {
    setEditingLecture(undefined);
    setModalOpen(true);
  };

  const handleEdit = (lecture: LectureResponse) => {
    setEditingLecture(lecture);
    setModalOpen(true);
  };

  const { mutateAsync: deleteLectureMutate } = useDeleteLectureMutation();

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteLectureMutate(confirmDelete);
      showSuccess("Lecture deleted successfully");
      refetch();
    } catch (err) {
      handleError(err, "Failed to delete lecture");
    } finally {
      setConfirmDelete(null);
    }
  };

  if (loading) {
    return (
      <Card sx={{ p: 1 }}>
        <ListSkeleton count={4} avatarVariant="rounded" />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: 1,
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
          <ButtonAction
            tooltip="Create Lecture"
            icon={<FilePlus size={20} />}
            onClick={handleCreate}
            color="primary"
          />
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
                  <ButtonAction
                    tooltip="Manage"
                    variant="soft"
                    color="default"
                    onClick={() =>
                      router.push(
                        `/lecturer/courses/${courseId}/lectures/${lecture.id}`,
                      )
                    }
                    icon={<Settings size={18} />}
                  />
                  <ButtonAction
                    tooltip="Edit"
                    variant="soft"
                    color="warning"
                    onClick={() => handleEdit(lecture)}
                    icon={<Pencil size={18} />}
                  />
                  <ButtonAction
                    tooltip="Delete"
                    variant="soft"
                    color="error"
                    onClick={() => setConfirmDelete(lecture.id)}
                    icon={<Trash2 size={18} />}
                  />
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>

      <LectureFormDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          refetch();
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
