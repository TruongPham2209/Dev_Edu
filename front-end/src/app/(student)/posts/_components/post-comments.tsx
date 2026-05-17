"use client";

import { Box, Typography, TextField, Button, Stack, Card, CardContent } from "@mui/material";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/use-auth";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { getForumComments, createForumComment, getForumCommentReplies } from "@/lib/api/forum";
import type { ForumCommentResponse } from "@/lib/api/types";
import { InfiniteLoadButton } from "@/components/common/infinite-load-button";
import { MessageSquare } from "lucide-react";
import { CommentItem } from "./comment-item";

interface PostCommentsProps {
  postId: string;
}

export function PostComments({ postId }: PostCommentsProps) {
  const { isAuthenticated } = useAuth();
  const { handleError, showSuccess } = useApiWithToast();
  
  const [comments, setComments] = useState<ForumCommentResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadComments = async (cursor?: string) => {
    try {
      const response = await getForumComments(postId, cursor);
      setComments((prev) => 
        cursor ? [...prev, ...response.contents] : response.contents
      );
      setNextCursor(response.nextCursor ?? undefined);
      setHasMore(Boolean(response.nextCursor));
    } catch (error) {
      handleError(error, "Không thể tải bình luận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!commentInput.trim()) return;
    setSubmitting(true);
    try {
      const newComment = await createForumComment({
        postId,
        content: commentInput.trim(),
      });
      showSuccess("Đã gửi bình luận");
      setComments((prev) => [newComment, ...prev]);
      setCommentInput("");
    } catch (error) {
      handleError(error, "Không thể gửi bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }} id="comments">
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
        <MessageSquare size={24} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Bình luận
        </Typography>
      </Stack>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder={
            isAuthenticated ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận"
          }
          value={commentInput}
          onChange={(event) => setCommentInput(event.target.value)}
          disabled={!isAuthenticated || submitting}
          multiline
          minRows={2}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: 'background.paper'
            }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="contained"
            onClick={handleSubmitComment}
            disabled={!isAuthenticated || !commentInput.trim() || submitting}
            sx={{ borderRadius: 2, px: 4 }}
          >
            {submitting ? "Đang gửi..." : "Gửi bình luận"}
          </Button>
        </Box>
      </Box>

      {loading && comments.length === 0 ? (
        <Stack spacing={3}>
          {[1, 2, 3].map((i) => (
            <Card key={i} variant="outlined" sx={{ borderRadius: 2, border: 'none', bgcolor: 'transparent' }}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'action.hover' }} />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ width: '30%', height: 20, bgcolor: 'action.hover', mb: 1, borderRadius: 1 }} />
                    <Box sx={{ width: '100%', height: 60, bgcolor: 'action.hover', borderRadius: 1 }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : comments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <MessageSquare size={48} opacity={0.2} style={{ marginBottom: 16 }} />
          <Typography>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} postId={postId} />
          ))}
        </Stack>
      )}

      {hasMore && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <InfiniteLoadButton
            loading={loading}
            hasMore={hasMore}
            onLoadMore={() => loadComments(nextCursor)}
          />
        </Box>
      )}
    </Box>
  );
}
