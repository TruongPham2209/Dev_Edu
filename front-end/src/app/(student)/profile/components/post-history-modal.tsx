import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Stack, Divider } from "@mui/material";
import { ExtendedPostResponse } from "@/components/post/post-card";
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { getPostVersionsByPostId } from "@/lib/api/forum";

interface PostHistoryModalProps {
  open: boolean;
  post: ExtendedPostResponse;
  onClose: () => void;
}

export function PostHistoryModal({ open, post, onClose }: PostHistoryModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      getPostVersionsByPostId(post.id)
        .then((res: any) => {
          // res is unknown, assume it's an array for now or has contents
          setHistory(Array.isArray(res) ? res : res?.contents || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, post.id]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <History size={20} /> Lịch sử chỉnh sửa
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Typography sx={{ mt: 2, color: "#64748b" }}>Đang tải lịch sử...</Typography>
        ) : history.length === 0 ? (
          <Typography sx={{ mt: 2, color: "#64748b" }}>Không có lịch sử chỉnh sửa nào.</Typography>
        ) : (
          <Stack spacing={3} sx={{ mt: 2 }}>
            {history.map((item, index) => (
              <Box key={index}>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  {new Date(item.updatedAt || Date.now()).toLocaleString("vi-VN")}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {item.content || item.shortDescription || "Không có nội dung thay đổi."}
                </Typography>
                {index < history.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} color="inherit">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
