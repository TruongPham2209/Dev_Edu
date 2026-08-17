"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { AssignmentFormDialog } from "@/components/dialog/assignment-form";
import {
  useAssignmentsQuery,
  useDeleteAssignmentMutation,
} from "@/lib/api/assignments";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Calendar,
  ClipboardList,
  ClipboardPen,
  Eye,
  FileText,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
  const { handleError, showSuccess } = useApiWithToast();
  const router = useRouter();

  const [dialogOpen, setDialogOpen] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: assignments = [], isLoading: loading } =
    useAssignmentsQuery(lectureId);
  const { mutateAsync: deleteAssignmentMutate } = useDeleteAssignmentMutation();

  useEffect(() => {
    onCountChange?.(assignments.length);
  }, [assignments, onCountChange]);

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteAssignmentMutate(deletingId);
      showSuccess("Deleted assignment successfully");
    } catch (err) {
      handleError(err, "Failed to delete assignment");
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
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
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        borderColor: "divider",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.01)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: 1,
          borderColor: "divider",
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          bgcolor: "grey.50",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: "primary.50",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <ClipboardList size={20} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                fontSize: { xs: "1.1rem", sm: "1.25rem" },
              }}
            >
              Assignments
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
              }}
            >
              Manage practical assignments and essay questions to evaluate
              student competence.
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Add assignment" arrow>
          <IconButton
            onClick={handleOpenDialog}
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              bgcolor: "primary.main",
              color: "white",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.18)",
              transition: "all 0.2s ease",
              flexShrink: 0,

              "&:hover": {
                bgcolor: "primary.dark",
                transform: "translateY(-1px) scale(1.03)",
                boxShadow: "0 6px 18px rgba(25, 118, 210, 0.28)",
              },
            }}
          >
            <ClipboardPen size={18} strokeWidth={2.2} />
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments yet"
            subtitle="Create assignments to evaluate student learning."
            icon={<ClipboardList size={40} />}
          />
        ) : (
          <Stack spacing={2}>
            {assignments.map((assignment) => {
              return (
                <Card
                  key={assignment.id}
                  variant="outlined"
                  sx={{
                    borderRadius: 1,
                    borderColor: "divider",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.light",
                      boxShadow: "0 4px 12px rgba(37, 99, 235, 0.03)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "stretch", sm: "flex-start" },
                        gap: { xs: 1.5, sm: 2 },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: { xs: "column", sm: "row" },
                            alignItems: { xs: "flex-start", sm: "center" },
                            justifyContent: "space-between",
                            gap: { xs: 0.75, sm: 1.5 },
                            mb: assignment.description ? 1 : 0,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              minWidth: 0,
                            }}
                          >
                            <Box
                              sx={{
                                p: 0.75,
                                borderRadius: 1.5,
                                bgcolor: "rgba(37, 99, 235, 0.08)",
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
                                fontSize: { xs: "0.9rem", sm: "1.025rem" },
                                lineHeight: 1.35,
                                wordBreak: "break-word",
                              }}
                            >
                              {assignment.title}
                            </Typography>
                          </Box>

                          <Stack
                            direction="row"
                            spacing={0.75}
                            sx={{
                              alignItems: "center",
                              color: "text.secondary",
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: "grey.50",
                              borderRadius: 1,
                              px: 1,
                              py: 0.25,
                              flexShrink: 0,
                              alignSelf: { xs: "flex-start", sm: "center" },
                            }}
                          >
                            <Calendar size={13} />
                            <Typography
                              variant="caption"
                              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, fontWeight: 500 }}
                            >
                              {formatServerDate(
                                assignment.createdAt,
                                "datetime",
                              )}
                            </Typography>
                          </Stack>
                        </Box>

                        {/* Description render */}
                        {assignment.description && (
                          <Box
                            sx={{
                              color: "text.secondary",
                              fontSize: { xs: "0.8rem", sm: "0.875rem" },
                              lineHeight: 1.6,
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
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: { xs: "flex-end", sm: "initial" },
                          gap: 1,
                          flexShrink: 0,
                          pt: { xs: 1, sm: 0 },
                          borderTop: { xs: "1px dashed", sm: "none" },
                          borderColor: "divider",
                        }}
                      >
                        <ButtonAction
                          onClick={() =>
                            router.push(
                              `/lecturer/courses/${courseId}/lectures/${lectureId}/assignments/${assignment.id}`,
                            )
                          }
                          color="primary"
                          variant="soft"
                          icon={<Eye size={18} />}
                          tooltip="View & Manage"
                        />
                        <ButtonAction
                          color="error"
                          variant="soft"
                          icon={<Trash2 size={18} />}
                          tooltip="Delete"
                          onClick={() => handleDeleteClick(assignment.id)}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </CardContent>

      {/* Add/Create Assignment Dialog */}
      <AssignmentFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        lectureId={lectureId}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete assignment?"
        description={`All student submissions and feedback for the assignment "${
          assignments.find((a) => a.id === deletingId)?.title || "this"
        }" will be deleted. This action cannot be undone.`}
        confirmLabel="Delete assignment"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Card>
  );
}
