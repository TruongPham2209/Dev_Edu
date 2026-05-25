"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/skeleton";
import { deleteLecture, getLecturesByCourse } from "@/lib/api/lectures";
import type { LectureResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { BookOpen, Edit, Eye, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LectureFormDialog } from "../../../../../components/dialog/lecture-form";

interface LecturesListProps {
  courseId: string;
  onTotalCountChange?: (count: number) => void;
}

export const LecturesList = ({
  courseId,
  onTotalCountChange,
}: LecturesListProps) => {
  const { handleError, showSuccess } = useApiWithToast();
  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Dialog / Modal States
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<
    LectureResponse | undefined
  >(undefined);

  // Track active fetch
  const isFetchingRef = useRef(false);

  const fetchLectures = useCallback(async () => {
    if (!courseId || isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const data = await getLecturesByCourse(courseId);
      setLectures(data || []);
      if (onTotalCountChange) {
        onTotalCountChange(data?.length || 0);
      }
    } catch (err) {
      handleError(err, "Failed to load lectures");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [courseId, handleError, onTotalCountChange]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const handleDelete = async () => {
    if (!confirmDeleteId || deleting) return;
    setDeleting(true);
    try {
      await deleteLecture(confirmDeleteId);
      showSuccess("Deleted lecture successfully!");
      setConfirmDeleteId(null);
      // Reload lectures list
      await fetchLectures();
    } catch (err) {
      handleError(err, "Failed to delete lecture");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateTrigger = () => {
    setEditingLecture(undefined);
    setModalOpen(true);
  };

  const handleEditTrigger = (lecture: LectureResponse) => {
    setEditingLecture(lecture);
    setModalOpen(true);
  };

  const selectedDeleteLecture = lectures?.find((l) => l.id === confirmDeleteId);

  return (
    <Card
      sx={{
        borderRadius: 1,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background: "rgba(255, 255, 255, 0.9)",
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        height: 520, // Consistent height for the Data Row
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              bgcolor: "rgba(37, 99, 235, 0.08)",
              color: "rgb(37, 99, 235)",
              width: 36,
              height: 36,
              border: "1px solid rgba(37, 99, 235, 0.12)",
            }}
          >
            <BookOpen size={18} />
          </Avatar>
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}
            >
              Lectures List
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage lectures for this course
            </Typography>
          </Box>
        </Box>

        <ButtonAction
          icon={<BookOpen size={18} />}
          tooltip="Create lecture"
          onClick={handleCreateTrigger}
          color="primary"
        />
      </Box>

      {/* Content Area */}
      <CardContent
        sx={{
          p: 0,
          flexGrow: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          "&:last-child": { pb: 0 },
        }}
      >
        {loading ? (
          <ListSkeleton count={4} avatarVariant="rounded" />
        ) : lectures.length === 0 ? (
          <Box sx={{ m: "auto", p: 4, width: "100%" }}>
            <EmptyState
              title="No lectures"
              subtitle="This course has no lectures yet."
              actionLabel="Create a new lecture"
              onAction={handleCreateTrigger}
            />
          </Box>
        ) : (
          <Stack spacing={0} sx={{ width: "100%" }}>
            {lectures.map((lecture, index) => (
              <Box key={lecture.id}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 3,
                    py: 2,
                    transition: "background-color 0.15s ease",
                    "&:hover": {
                      bgcolor: "rgba(15, 23, 42, 0.02)",
                    },
                  }}
                >
                  <Stack
                    component="div"
                    direction="row"
                    spacing={2.5}
                    sx={{ alignItems: "center", overflow: "hidden", mr: 2 }}
                  >
                    <Avatar
                      variant="rounded"
                      sx={{
                        bgcolor: "rgba(37, 99, 235, 0.05)",
                        color: "primary.main",
                        width: 40,
                        height: 40,
                        border: "1px solid rgba(37, 99, 235, 0.12)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 800, fontSize: "0.95rem" }}>
                        {index + 1}
                      </Typography>
                    </Avatar>
                    <Box sx={{ overflow: "hidden" }}>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: "text.primary",
                          fontSize: "0.95rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {lecture.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 500,
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {lecture.summary || "Không có tóm tắt"}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    <Tooltip title="View and manage details" arrow>
                      <IconButton
                        component={Link}
                        href={`/admin/courses/${courseId}/lectures/${lecture.id}`}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          color: "primary.main",
                          bgcolor: "rgba(37,99,235,0.06)",
                          "&:hover": {
                            bgcolor: "rgba(37,99,235,0.12)",
                          },
                        }}
                      >
                        <Eye size={15} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit" arrow>
                      <IconButton
                        onClick={() => handleEditTrigger(lecture)}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          color: "warning.main",
                          bgcolor: "rgba(237,108,2,0.06)",
                          "&:hover": {
                            bgcolor: "rgba(237,108,2,0.12)",
                          },
                        }}
                      >
                        <Edit size={15} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete lecture" arrow>
                      <IconButton
                        onClick={() => setConfirmDeleteId(lecture.id)}
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: 2,
                          color: "error.main",
                          bgcolor: "rgba(211,47,47,0.06)",
                          "&:hover": {
                            bgcolor: "rgba(211,47,47,0.12)",
                          },
                        }}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
                {index < lectures.length - 1 && (
                  <Divider
                    sx={{ mx: 3, borderColor: "rgba(15, 23, 42, 0.04)" }}
                  />
                )}
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>

      {/* Save Modal */}
      <LectureFormDialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchLectures}
        courseId={courseId}
        initialData={editingLecture}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(confirmDeleteId)}
        title="Delete lecture?"
        description={
          deleting
            ? `Deleting lecture "${selectedDeleteLecture?.title || ""}"...`
            : `Are you sure you want to delete lecture "${selectedDeleteLecture?.title || ""}"? This action will permanently delete the content and related exercises.`
        }
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </Card>
  );
};
