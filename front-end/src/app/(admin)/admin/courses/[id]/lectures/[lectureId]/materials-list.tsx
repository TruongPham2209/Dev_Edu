"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { MaterialFormDialog } from "@/components/dialog/material-form";
import { getDownloadUrl } from "@/lib/api/files";
import { deleteMaterial } from "@/lib/api/lectures";
import type { MaterialResponse } from "@/lib/api/types";
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingTitle, setDeletingTitle] = useState<string>("");
  const [exitingIds, setExitingIds] = useState<string[]>([]);

  const handleDownload = async (material: MaterialResponse) => {
    try {
      const res = await getDownloadUrl(material.fileObjectKey);
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

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteMaterial(deletingId);
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
        boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.02)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
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
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.light",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.03)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <CardContent sx={{ p: "16px !important" }}>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          sx={{ alignItems: "center", minWidth: 0 }}
                        >
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: 2.5,
                              bgcolor: "grey.50",
                              border: "1px solid",
                              borderColor: "grey.100",
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
                                color: "#1e293b",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
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
                                  bgcolor: "grey.300",
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
                          sx={{ flexShrink: 0 }}
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
