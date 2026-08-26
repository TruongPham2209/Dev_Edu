"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { AssignmentFormDialog } from "@/components/dialog/assignment-form";
import {
  useAssignmentsQuery,
  useDeleteAssignmentMutation,
} from "@/lib/api/assignments";
import { AssignmentResponse } from "@/lib/type/assignments";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import { Box, Card, CardContent, Stack, Typography, alpha } from "@mui/material";
import {
  Calendar,
  ClipboardList,
  ClipboardPlus,
  Eye,
  FileText,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AssignmentsListProps {
  courseId: string;
  lectureId: string;
}

export function AssignmentsList({ courseId, lectureId }: AssignmentsListProps) {
  const router = useRouter();
  const { handleError, showSuccess } = useApiWithToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<string>("");
  const { data: assignments = [] } = useAssignmentsQuery(lectureId);
  const { mutateAsync: deleteAssignmentMutate } = useDeleteAssignmentMutation();

  const handleDeleteClick = (assignment: AssignmentResponse) => {
    setDeletingId(assignment.id);
    setDeletingTitle(assignment.title);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteAssignmentMutate(deletingId);
      showSuccess(`Deleted ${deletingTitle} successfully`);
    } catch (err) {
      handleError(err, "Cannot delete assignment");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 4px 20px -2px rgba(0, 0, 0, 0.4)"
            : "0 4px 20px -2px rgba(15, 23, 42, 0.02)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                fontSize: { xs: "1.05rem", sm: "1.25rem" },
              }}
            >
              Assignments
            </Typography>
          </Box>
          <ButtonAction
            tooltip="Add assignment"
            icon={<ClipboardPlus size={20} />}
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
          />
        </Box>

        {/* Content list */}
        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            subtitle="Create assignments to test and evaluate students' practical skills."
            icon={<ClipboardList size={42} />}
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
                    bgcolor: "background.paper",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      borderColor: "primary.light",
                      boxShadow: (theme) =>
                        theme.palette.mode === "dark"
                          ? "0 4px 12px rgba(0, 0, 0, 0.4)"
                          : "0 4px 12px rgba(37, 99, 235, 0.03)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 1.5, sm: 3 },
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{
                            alignItems: "center",
                            mb: 1,
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              p: 0.75,
                              borderRadius: 1.5,
                              bgcolor: (theme) =>
                                alpha(
                                  theme.palette.primary.main,
                                  theme.palette.mode === "dark" ? 0.2 : 0.06,
                                ),
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
                              color: "text.primary",
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              wordBreak: "break-word",
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
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 1.5,
                              px: 1.25,
                              py: 0.25,
                            }}
                          >
                            <Calendar size={13} className="text-slate-400" />
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 550, fontSize: { xs: "0.75rem", sm: "0.8rem" } }}
                            >
                              Created at:{" "}
                              {formatServerDate(
                                assignment.createdAt,
                                "datetime",
                              )}
                            </Typography>
                          </Stack>
                        </Stack>

                        {/* Description render (TipTap html output) */}
                        <Box
                          sx={{
                            color: "text.secondary",
                            fontSize: { xs: "0.825rem", sm: "0.875rem" },
                            lineHeight: 1.6,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            WebkitLineClamp: 2,
                            wordBreak: "break-word",
                            "& p": { m: 0 },
                          }}
                          dangerouslySetInnerHTML={{
                            __html: assignment.description,
                          }}
                        />
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexShrink: 0, alignItems: "center", alignSelf: { xs: "flex-end", sm: "center" } }}
                      >
                        <ButtonAction
                          onClick={() =>
                            router.push(
                              `/admin/courses/${courseId}/lectures/${lectureId}/assignments/${assignment.id}`,
                            )
                          }
                          tooltip="Detail"
                          icon={<Eye size={18} />}
                          variant="soft"
                          color="primary"
                        />
                        <ButtonAction
                          tooltip="Delete assignment"
                          icon={<Trash2 size={18} />}
                          variant="soft"
                          color="error"
                          onClick={() => handleDeleteClick(assignment)}
                        />
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </CardContent>

      <AssignmentFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        lectureId={lectureId}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete assignment?"
        description={`Are you sure you want to delete assignment "${deletingTitle}"? All submission results from students will be permanently lost and cannot be restored.`}
        confirmLabel="Delete assignment"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Card>
  );
}
