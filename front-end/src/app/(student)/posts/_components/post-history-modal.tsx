"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Skeleton,
  Divider,
} from "@mui/material";
import { X, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { getPostVersionsByPostId } from "@/lib/api/forum";
import { useApiWithToast } from "@/lib/use-api-with-toast";

interface PostHistoryModalProps {
  open: boolean;
  onClose: () => void;
  postId: string;
}

export function PostHistoryModal({ open, onClose, postId }: PostHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<any[]>([]);
  const { handleError } = useApiWithToast();

  useEffect(() => {
    if (!open) return;
    
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response: any = await getPostVersionsByPostId(postId, "APPROVED");
        if (isMounted) {
          // Assuming response contains versions array or is an array itself
          // We will fallback to empty array if format is unknown
          setVersions(Array.isArray(response) ? response : response?.contents || []);
        }
      } catch (error) {
        if (isMounted) handleError(error, "Không thể tải lịch sử chỉnh sửa");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [open, postId, handleError]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Clock size={24} />
        <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
          Lịch sử chỉnh sửa
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: "text.secondary",
          }}
        >
          <X size={20} />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 3, pt: 0 }}>
        {loading ? (
          <Stack spacing={3}>
            {[1, 2, 3].map((i) => (
              <Box key={i}>
                <Skeleton width="40%" height={24} sx={{ mb: 1 }} />
                <Skeleton width="100%" height={20} />
                <Skeleton width="80%" height={20} />
              </Box>
            ))}
          </Stack>
        ) : versions.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Không có dữ liệu lịch sử chỉnh sửa.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {versions.map((version, index) => (
              <Box key={version.id || index}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Phiên bản {versions.length - index}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {version.createdAt ? new Date(version.createdAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "Không rõ"}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {version.shortDescription || version.title}
                </Typography>
                {index < versions.length - 1 && <Divider />}
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
