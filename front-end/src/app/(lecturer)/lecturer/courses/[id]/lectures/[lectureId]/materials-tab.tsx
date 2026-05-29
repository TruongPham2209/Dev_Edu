"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { MaterialFormDialog } from "@/components/dialog/material-form";
import { getDownloadUrl } from "@/lib/api/files";
import { deleteMaterial, getMaterials } from "@/lib/api/lectures";
import type { MaterialResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import { getFileIcon } from "@/lib/util/file-utils";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Download, File, FilePlus2, Paperclip, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface MaterialsTabProps {
  lectureId: string;
  onCountChange?: (count: number) => void;
}

export function MaterialsTab({ lectureId, onCountChange }: MaterialsTabProps) {
  const { handleError, showSuccess } = useApiWithToast();

  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exitingIds, setExitingIds] = useState<string[]>([]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await getMaterials(lectureId);
      setMaterials(data);
    } catch (err) {
      handleError(err, "Failed to load materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [lectureId]);

  useEffect(() => {
    onCountChange?.(materials.length);
  }, [materials, onCountChange]);

  const handleDownload = async (material: MaterialResponse) => {
    try {
      const res = await getDownloadUrl(material.fileObjectKey);
      const downloadUrl = res.downloadUrl || res.publicUrl;
      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        throw new Error("Failed to generate download URL");
      }
    } catch (err) {
      handleError(err, "Failed to download file");
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteMaterial(deletingId);
      showSuccess("Deleted material successfully");

      // Smooth exit animation
      setExitingIds((prev) => [...prev, deletingId]);
    } catch (err) {
      handleError(err, "Failed to delete material");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAnimationExited = (id: string) => {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    setExitingIds((prev) => prev.filter((exId) => exId !== id));
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
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card
            key={idx}
            variant="outlined"
            sx={{
              borderRadius: 3,
              borderColor: "divider",
              p: 2,
            }}
          >
            <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: "grey.100",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    width: "40%",
                    height: 20,
                    bgcolor: "grey.100",
                    borderRadius: 1,
                    mb: 1,
                  }}
                />
                <Box
                  sx={{
                    width: "25%",
                    height: 14,
                    bgcolor: "grey.100",
                    borderRadius: 0.5,
                  }}
                />
              </Box>
            </Stack>
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
          px: 3,
          py: 2,
          bgcolor: "grey.50",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "primary.50",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              mt: 0.5,
            }}
          >
            <Paperclip size={20} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
              Attached materials
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              List of learning materials, lecture slides, or additional
              readings.
            </Typography>
          </Box>
        </Box>
        <Tooltip title="Add material" arrow>
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
            <FilePlus2 size={20} strokeWidth={2.2} />
          </IconButton>
        </Tooltip>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {materials.length === 0 ? (
          <EmptyState
            title="No materials yet"
            subtitle="Upload PDF, Slide, Zip, or Video files for students to reference."
            icon={<File size={40} />}
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
                                fontWeight: 700,
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
                                  fontWeight: 500,
                                }}
                              >
                                {extension} format
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
                            color="primary"
                            variant="soft"
                            icon={<Download size={18} />}
                            tooltip="Download"
                            onClick={() => handleDownload(material)}
                          />
                          <ButtonAction
                            color="error"
                            variant="soft"
                            icon={<Trash2 size={18} />}
                            tooltip="Delete material"
                            onClick={() => handleDeleteClick(material.id)}
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

      {/* Upload Material Dialog */}
      <MaterialFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        lectureId={lectureId}
        onSuccess={(newMaterial) => {
          setMaterials((prev) => [newMaterial, ...prev]);
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingId)}
        title="Delete material?"
        description={`Students will no longer be able to view or download the material "${
          materials.find((m) => m.id === deletingId)?.fileOriginalName ||
          materials.find((m) => m.id === deletingId)?.title ||
          "this"
        }". This action cannot be undone.`}
        confirmLabel="Delete material"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </Card>
  );
}
