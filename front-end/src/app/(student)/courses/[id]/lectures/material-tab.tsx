"use client";

import ButtonAction from "@/components/common/button-action";
import { EmptyState } from "@/components/common/empty-state";
import { getDownloadUrl } from "@/lib/api/files";
import { useMaterialsQuery } from "@/lib/api/lectures";
import { formatServerDate } from "@/lib/util/date-utils";
import { getFileIcon } from "@/lib/util/file-utils";
import {
  alpha,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { FileDown, File as FileIcon } from "lucide-react";

interface TabMaterialsProps {
  lectureId: string;
}

export function TabMaterials({ lectureId }: TabMaterialsProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading: loading } =
    useMaterialsQuery(lectureId);

  const handleDownload = async (objectKey: string) => {
    try {
      const response = await queryClient.fetchQuery({
        queryKey: ["files", "download", objectKey],
        queryFn: () => getDownloadUrl(objectKey),
      });
      if (response.downloadUrl) {
        window.open(response.downloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Failed to get download URL", err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (materials.length === 0) {
    return (
      <EmptyState
        title="No materials found"
        subtitle="No materials uploaded yet."
      />
    );
  }

  return (
    <Stack spacing={1.5}>
      {materials.map((material) => (
        <Paper
          key={material.id}
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 2 },
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            transition: "all 0.2s ease",
            bgcolor: "background.paper",
            "&:hover": {
              borderColor: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, 0.01),
            },
          }}
        >
          <Stack
            direction="row"
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ alignItems: "center" }}
          >
            <Box
              sx={{
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                borderRadius: 1,
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {getFileIcon(material.fileObjectKey, 20)}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "text.primary",
                  mb: 0.25,
                  fontSize: { xs: "0.85rem", sm: "0.875rem" },
                }}
              >
                {material.title}
              </Typography>
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}
              >
                {material.fileOriginalName && (
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{ alignItems: "center", color: "text.disabled" }}
                  >
                    <FileDown size={12} />
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                    >
                      Uploaded: {formatServerDate(material.uploadedAt)}
                    </Typography>
                  </Stack>
                )}
                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    alignItems: "center",
                    color: "text.disabled",
                  }}
                >
                  <FileIcon size={12} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.7rem",
                      wordBreak: "break-all",
                    }}
                  >
                    {material.fileOriginalName}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <ButtonAction
              tooltip="Download"
              icon={<FileDown size={18} />}
              variant="soft-dark"
              color="primary"
              onClick={() => handleDownload(material.fileObjectKey)}
            />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
