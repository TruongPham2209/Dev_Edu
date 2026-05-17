"use client";

import { EmptyState } from "@/components/common/empty-state";
import { getMaterials } from "@/lib/api/lectures";
import { MaterialResponse } from "@/lib/api/types";
import { getDownloadUrl } from "@/lib/api/files";
import {
  alpha,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { FileDown, File as FileIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { formatServerDate } from "@/lib/date-utils";

interface TabMaterialsProps {
  lectureId: string;
}

export function TabMaterials({ lectureId }: TabMaterialsProps) {
  const theme = useTheme();
  const [materials, setMaterials] = useState<MaterialResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const data = await getMaterials(lectureId);
        setMaterials(data);
      } catch (err) {
        console.error("Failed to fetch materials", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [lectureId]);

  const handleDownload = async (objectKey: string) => {
    try {
      const response = await getDownloadUrl(objectKey);
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
        title="Chưa có tài liệu nào"
        subtitle="Giảng viên chưa cập nhật tài liệu cho bài học này."
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
            p: 2,
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
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1,
                bgcolor: alpha(theme.palette.text.primary, 0.04),
                color: "text.secondary",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileIcon size={22} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "text.primary", mb: 0.25 }}
              >
                {material.title}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: "text.disabled" }}>
                  <FileIcon size={12} />
                  <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.7rem" }}>
                    Tài liệu học tập
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: "center", color: "text.disabled" }}>
                  <FileDown size={12} />
                  <Typography variant="caption" sx={{ fontWeight: 500, fontSize: "0.7rem" }}>
                    Cập nhật: {formatServerDate(material.uploadedAt)}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDown size={14} />}
              sx={{ 
                borderRadius: 1, 
                px: 2, 
                py: 0.75,
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.825rem",
                minWidth: { sm: 120 }
              }}
              onClick={() => handleDownload(material.fileObjectKey)}
            >
              Tải xuống
            </Button>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
