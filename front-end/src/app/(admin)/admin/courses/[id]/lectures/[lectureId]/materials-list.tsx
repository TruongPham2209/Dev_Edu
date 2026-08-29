"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { MaterialFormDialog } from "@/components/dialog/material-form";
import { getDownloadUrl } from "@/lib/api/files";
import { useDeleteMaterialMutation } from "@/lib/api/lectures";
import type { MaterialResponse } from "@/lib/type/lectures";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import { getFileIcon } from "@/lib/util/file-utils";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  Stack,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { Download, File, FilePlus, Trash2 } from "lucide-react";
import { useState } from "react";

interface MaterialsListProps {
  materials: MaterialResponse[];
  lectureId: string;
  onMaterialCreated: (newMaterial: MaterialResponse) => void;
  onMaterialDeleted: (deletedId: string) => void;
}

export function MaterialsList({
  materials,
  lectureId,
  onMaterialCreated,
  onMaterialDeleted,
}: MaterialsListProps) {
  const { handleError, showSuccess } = useApiWithToast();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<string>("");
  const [exitingIds, setExitingIds] = useState<string[]>([]);

  const handleDownload = async (material: MaterialResponse) => {
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ["files", "download", material.fileObjectKey],
        queryFn: () => getDownloadUrl(material.fileObjectKey),
      });
      const downloadUrl = res.downloadUrl || res.publicUrl;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        throw new Error("Could not generate download URL");
      }
    } catch (err) {
      handleError(err, "Could not download material");
    }
  };

  const handleDeleteClick = (material: MaterialResponse) => {
    setDeletingId(material.id);
    setDeletingTitle(material.title);
  };

  const { mutateAsync: deleteMaterialMutate } = useDeleteMaterialMutation();

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteMaterialMutate(deletingId);
      showSuccess(`Deleted material "${deletingTitle}" successfully`);

      // Exit animation
      setExitingIds((prev) => [...prev, deletingId]);
    } catch (err) {
      handleError(err, "Could not delete material");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnimationExited = (id: string) => {
    onMaterialDeleted(id);
    setExitingIds((prev) => prev.filter((exId) => exId !== id));
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
              Materials
            </Typography>
          </Box>
          <ButtonAction
            tooltip="Add material"
            icon={<FilePlus size={20} />}
            variant="contained"
            color="primary"
            onClick={() => setDialogOpen(true)}
          />
        </Box>

        {/* Content list */}
        {materials.length === 0 ? (
          <EmptyState
            title="No materials yet"
            subtitle="Upload presentation slides, PDF files, images, or videos to support students."
            icon={<File size={42} />}
          />
        ) : (
          <Stack spacing={2}>
            {materials.map((material) => {
              const isExiting = exitingIds.includes(material.id);
              const fileName = material.fileOriginalName || material.title;
              const extension =
                fileName.split(".").pop()?.toUpperCase() || "FILE";

              return (
                <Collapse
                  key={material.id}
                  in={!isExiting}
                  timeout={300}
                  onExited={() => handleAnimationExited(material.id)}
                >
                  <Card
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
                    <CardContent sx={{ p: { xs: "12px !important", sm: "16px !important" } }}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={{ xs: 1.5, sm: 2 }}
                        sx={{
                          alignItems: { xs: "flex-start", sm: "center" },
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ alignItems: "center", minWidth: 0, width: "100%" }}
                        >
                          <Box
                            sx={{
                              width: { xs: 40, sm: 48 },
                              height: { xs: 40, sm: 48 },
                              borderRadius: 2.5,
                              bgcolor: "action.hover",
                              border: "1px solid",
                              borderColor: "divider",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {getFileIcon(fileName, 24)}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
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
                              {material.title}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{
                                alignItems: "center",
                                flexWrap: "wrap",
                                mt: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 550,
                                }}
                              >
                                File type: {extension}
                              </Typography>
                              <Box
                                sx={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: "50%",
                                  bgcolor: "text.disabled",
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                Uploaded at:{" "}
                                {formatServerDate(
                                  material.uploadedAt,
                                  "datetime",
                                )}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>

                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ flexShrink: 0, alignSelf: { xs: "flex-end", sm: "center" } }}
                        >
                          <ButtonAction
                            tooltip="Download"
                            icon={<Download size={18} />}
                            variant="soft"
                            color="primary"
                            onClick={() => handleDownload(material)}
                          />
                          <ButtonAction
                            tooltip="Delete material"
                            icon={<Trash2 size={18} />}
                            variant="soft"
                            color="error"
                            onClick={() => handleDeleteClick(material)}
                          />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Collapse>
              );
            })}
          </Stack>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <MaterialFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        lectureId={lectureId}
        onSuccess={(newMaterial) => {
          onMaterialCreated(newMaterial);
        }}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete material?"
        description={`Are you sure you want to delete material "${deletingTitle}" ? This action cannot be undone.`}
        confirmLabel="Delete material"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Card>
  );
}