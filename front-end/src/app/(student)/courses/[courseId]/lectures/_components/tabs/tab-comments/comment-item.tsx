"use client";

import { 
  Box, 
  Avatar, 
  Typography, 
  Stack, 
  IconButton, 
  Button, 
  TextField, 
  alpha,
  useTheme,
  Collapse,
  Paper
} from "@mui/material";
import { MessageSquare, Trash2, CornerDownRight, MoreVertical } from "lucide-react";
import { useState } from "react";
import { LectureCommentResponse } from "@/lib/api/types";
import { createLectureComment, deleteLectureComment } from "@/lib/api/lectures";
import { formatServerDate } from "@/lib/date-utils";

interface CommentItemProps {
  comment: LectureCommentResponse;
  lectureId: string;
  onRefresh: () => void;
  depth?: number;
  replies?: LectureCommentResponse[];
}

export function CommentItem({ 
  comment, 
  lectureId, 
  onRefresh, 
  depth = 0,
  replies = []
}: CommentItemProps) {
  const theme = useTheme();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await createLectureComment({
        lectureId,
        content: replyContent,
        parentCommentId: comment.id
      });
      setReplyContent("");
      setIsReplying(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to post reply", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await deleteLectureComment(comment.id);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  return (
    <Box sx={{ mt: depth === 0 ? 3 : 2 }}>
      <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
        <Avatar 
          sx={{ 
            width: depth === 0 ? 40 : 32, 
            height: depth === 0 ? 40 : 32,
            bgcolor: "primary.main",
            fontSize: depth === 0 ? "1rem" : "0.8rem"
          }}
        >
          {/* We don't have author name in current API response, using placeholder */}
          U
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: comment.isDeleted ? "action.hover" : (depth === 0 ? "background.default" : "transparent"),
              border: depth > 0 ? "none" : "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Người dùng {comment.isMine && "(Bạn)"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatServerDate(comment.createdAt, "datetime")}
                </Typography>
              </Box>
              
              {comment.isMine && !comment.isDeleted && (
                <IconButton size="small" onClick={handleDelete} color="error">
                  <Trash2 size={16} />
                </IconButton>
              )}
            </Stack>
            
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                color: comment.isDeleted ? "text.disabled" : "text.primary",
                fontStyle: comment.isDeleted ? "italic" : "normal"
              }}
            >
              {comment.isDeleted ? "Bình luận này đã bị xóa" : comment.content}
            </Typography>
          </Paper>

          {/* Actions */}
          {!comment.isDeleted && depth < 2 && (
            <Stack direction="row" spacing={2} sx={{ mt: 0.5, ml: 1 }}>
              <Button 
                size="small" 
                startIcon={<MessageSquare size={14} />} 
                onClick={() => setIsReplying(!isReplying)}
                sx={{ textTransform: "none", color: "text.secondary", fontSize: "0.75rem" }}
              >
                Trả lời
              </Button>
            </Stack>
          )}

          {/* Reply Input */}
          <Collapse in={isReplying}>
            <Box sx={{ mt: 2, ml: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Viết phản hồi..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                multiline
                rows={2}
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 1 }
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: "flex-end" }}>
                <Button size="small" onClick={() => setIsReplying(false)}>Hủy</Button>
                <Button 
                  size="small" 
                  variant="contained" 
                  disabled={!replyContent.trim() || submitting}
                  onClick={handleReply}
                >
                  Gửi
                </Button>
              </Stack>
            </Box>
          </Collapse>

          {/* Nested Replies Rendering */}
          {replies.length > 0 && (
            <Box sx={{ mt: 1, borderLeft: "2px solid", borderColor: "divider", pl: 2 }}>
               {replies.map((reply) => (
                 <CommentItem 
                  key={reply.id} 
                  comment={reply} 
                  lectureId={lectureId} 
                  onRefresh={onRefresh} 
                  depth={depth + 1}
                />
               ))}
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
