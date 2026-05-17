"use client";

import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { getLectureComments, createLectureComment } from "@/lib/api/lectures";
import { LectureCommentResponse } from "@/lib/api/types";
import { CommentItem } from "./comment-item";
import { EmptyState } from "@/components/common/empty-state";

interface TabCommentsProps {
  lectureId: string;
}

export function TabComments({ lectureId }: TabCommentsProps) {
  const theme = useTheme();
  const [comments, setComments] = useState<LectureCommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchComments = async (cursor?: string) => {
    if (cursor) setLoadingMore(true);
    else setLoading(true);

    try {
      const response = await getLectureComments({
        lectureId,
        nextCursor: cursor || undefined,
        size: 10,
      });

      if (cursor) {
        setComments((prev) => [...prev, ...response.contents]);
      } else {
        setComments(response.contents);
      }
      setNextCursor(response.nextCursor || null);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [lectureId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      await createLectureComment({
        lectureId,
        content: newComment,
      });
      setNewComment("");
      fetchComments(); // Refresh list
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  // Organize comments into root and replies for recursive rendering
  // Note: The API might already return them flat with parentId.
  // A real implementation would need to build the tree if the API doesn't.
  // For this demo, we'll assume we render root comments and they handle their own replies if fetched.
  const rootComments = comments.filter((c) => !c.parentCommentId);

  return (
    <Stack spacing={1.5}>
      {/* Post Comment Input */}
      <Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <TextField
            fullWidth
            placeholder="Chia sẻ suy nghĩ hoặc đặt câu hỏi về bài học này..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            multiline
            rows={3}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                bgcolor: "action.hover",
                "&:hover": { bgcolor: alpha(theme.palette.text.primary, 0.04) },
              },
            }}
          />
        </Stack>
        <Stack direction="row" sx={{ justifyContent: "flex-end", mt: 1.5 }}>
          <Button
            variant="contained"
            disabled={!newComment.trim() || submitting}
            startIcon={
              submitting ? <CircularProgress size={16} /> : <Send size={16} />
            }
            onClick={handlePostComment}
            sx={{
              borderRadius: 1,
              px: 3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Đăng bình luận
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ opacity: 0.6 }} />

      {/* Comment List */}
      <Box>
        {rootComments.length === 0 ? (
          <EmptyState
            title="Chưa có thảo luận nào"
            subtitle="Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ ý kiến của bạn."
          />
        ) : (
          <Stack spacing={1}>
            {rootComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                lectureId={lectureId}
                onRefresh={fetchComments}
                replies={comments.filter(
                  (c) => c.parentCommentId === comment.id,
                )}
              />
            ))}

            {nextCursor && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  onClick={() => fetchComments(nextCursor)}
                  disabled={loadingMore}
                  variant="outlined"
                  sx={{
                    borderRadius: 10,
                    px: 3,
                    textTransform: "none",
                    fontSize: "0.825rem",
                  }}
                >
                  {loadingMore ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : null}
                  Tải thêm bình luận
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
