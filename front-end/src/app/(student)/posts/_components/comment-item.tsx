"use client";

import { Box, Typography, Avatar, Stack, Button, TextField, Collapse } from "@mui/material";
import type { ForumCommentResponse } from "@/lib/api/types";
import { useState } from "react";
import { getForumCommentReplies, createForumComment } from "@/lib/api/forum";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { CornerDownRight } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

interface CommentItemProps {
  comment: ForumCommentResponse;
  postId: string;
  isReply?: boolean;
}

export function CommentItem({ comment, postId, isReply = false }: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyInput, setReplyInput] = useState("");
  const [replies, setReplies] = useState<ForumCommentResponse[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  
  const { handleError, showSuccess } = useApiWithToast();
  const { isAuthenticated } = useAuth();

  const handleToggleReplies = async () => {
    if (!showReplies && replies.length === 0 && comment.replyCount > 0) {
      await loadReplies();
    }
    setShowReplies(!showReplies);
  };

  const loadReplies = async (cursor?: string) => {
    setLoadingReplies(true);
    try {
      const response = await getForumCommentReplies(comment.id, cursor);
      setReplies(prev => cursor ? [...prev, ...response.contents] : response.contents);
      setNextCursor(response.nextCursor ?? undefined);
      setHasMore(Boolean(response.nextCursor));
      setLoadedCount(prev => prev + response.contents.length);
    } catch (error) {
      handleError(error, "Không thể tải phản hồi");
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyInput.trim()) return;
    setSubmitting(true);
    try {
      const newReply = await createForumComment({
        postId,
        content: replyInput.trim(),
        repliedToCommentId: comment.id,
      });
      showSuccess("Đã gửi phản hồi");
      setReplies(prev => [newReply, ...prev]);
      setReplyInput("");
      setShowReplyInput(false);
      if (!showReplies) setShowReplies(true);
    } catch (error) {
      handleError(error, "Không thể gửi phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Avatar sx={{ width: isReply ? 32 : 40, height: isReply ? 32 : 40, bgcolor: 'grey.300', color: 'grey.700' }}>
        {comment.author?.[0]?.toUpperCase() || "U"}
      </Avatar>
      
      <Box sx={{ flex: 1 }}>
        <Box sx={{ 
          bgcolor: isReply ? 'transparent' : 'action.hover', 
          p: isReply ? 0 : 2, 
          borderRadius: 2,
          mb: 1
        }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {comment.author || "Người dùng"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString("vi-VN", { day: "numeric", month: "short", year: "numeric" }) : ""}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ whiteSpace: "pre-line", wordBreak: 'break-word' }}>
            {comment.content}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          {!isReply && (
            <Button 
              size="small" 
              color="inherit" 
              onClick={() => setShowReplyInput(!showReplyInput)}
              sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary', minWidth: 'auto', p: 0 }}
            >
              Phản hồi
            </Button>
          )}
          
          {!isReply && comment.replyCount > 0 && (
            <Button 
              size="small" 
              color="primary" 
              onClick={handleToggleReplies}
              sx={{ textTransform: 'none', fontWeight: 600, minWidth: 'auto', p: 0 }}
            >
              {showReplies ? "Ẩn phản hồi" : `Xem ${comment.replyCount} phản hồi`}
            </Button>
          )}
        </Stack>

        <Collapse in={showReplyInput}>
          <Box sx={{ mb: 3, display: 'flex', gap: 1.5, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Viết phản hồi..."
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              disabled={!isAuthenticated || submitting}
              autoFocus
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            <Button 
              variant="contained" 
              onClick={handleSubmitReply}
              disabled={!isAuthenticated || !replyInput.trim() || submitting}
              sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
            >
              Gửi
            </Button>
          </Box>
        </Collapse>

        <Collapse in={showReplies}>
          {replies.length > 0 && (
            <Stack spacing={2} sx={{ mt: 2, position: 'relative' }}>
              <Box sx={{ 
                position: 'absolute', 
                left: -20, 
                top: 0, 
                bottom: 24, 
                width: 2, 
                bgcolor: 'divider' 
              }} />
              {replies.map((reply) => (
                <Box key={reply.id} sx={{ position: 'relative' }}>
                  <CornerDownRight size={16} color="#ccc" style={{ position: 'absolute', left: -20, top: 12 }} />
                  <CommentItem comment={reply} postId={postId} isReply={true} />
                </Box>
              ))}
              
              {hasMore && (
                <Button 
                  size="small" 
                  onClick={() => loadReplies(nextCursor)}
                  disabled={loadingReplies}
                  sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                >
                  {loadingReplies ? "Đang tải..." : `Xem thêm phản hồi`}
                </Button>
              )}
            </Stack>
          )}
        </Collapse>
      </Box>
    </Box>
  );
}
