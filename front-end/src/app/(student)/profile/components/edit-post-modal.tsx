import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material";
import { useState } from "react";
import { ExtendedPostResponse } from "@/components/post/post-card";
import { updateForumPost } from "@/lib/api/forum";

interface EditPostModalProps {
  open: boolean;
  post: ExtendedPostResponse;
  onClose: () => void;
  onSuccess: (updatedPost: ExtendedPostResponse) => void;
}

export function EditPostModal({ open, post, onClose, onSuccess }: EditPostModalProps) {
  const [title, setTitle] = useState(post.title);
  const [shortDescription, setShortDescription] = useState(post.shortDescription);
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await updateForumPost({
        postId: post.id,
        title,
        shortDescription,
        content,
        thumbObjectKey: "", // Handle image update properly in real implementation
      });
      onSuccess({ ...post, ...res });
    } catch (err) {
      console.error(err);
      alert("Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Chỉnh sửa bài viết</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Tiêu đề"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Mô tả ngắn"
            fullWidth
            multiline
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
          />
          <TextField
            label="Nội dung"
            fullWidth
            multiline
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onClose} disabled={loading} color="inherit">Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading} sx={{ bgcolor: "#0f172a" }}>
          {loading ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
