"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useAuth } from "@/lib/use-auth";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  alpha,
  Avatar,
  Box,
  Button,
  Collapse,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

export interface CommentNodeData {
  id: string;
  content: string | null;
  authorUsername?: string;
  authorAvatarUrl?: string;
  isDeleted?: boolean;
  isMine?: boolean;
  createdAt: string | Date;
  replyCount?: number;
  parentId?: string;
  [key: string]: unknown;
}

export interface CommentItemProps {
  id: string;
  content: string | null;
  authorUsername?: string;
  authorAvatarUrl?: string;
  isDeleted?: boolean;
  isMine?: boolean;
  createdAt: string | Date;
  replyCount?: number;
  parentId?: string;

  canDelete?: boolean;
  level?: number;
  maxDepth?: number;

  onDelete?: (id: string) => Promise<void>;
  onDeleteComplete?: (id: string) => void;
  onAddReply?: (content: string, replyToId: string) => Promise<CommentNodeData>;
  onLoadReply?: (
    parentId: string,
    nextCursor?: string | null,
  ) => Promise<{ contents: CommentNodeData[]; nextCursor?: string | null }>;

  onChildAddReply?: (newReply: CommentNodeData) => void;
}

export function CommentItem({
  id,
  content,
  authorUsername,
  authorAvatarUrl,
  isDeleted,
  isMine,
  createdAt,
  replyCount = 0,
  parentId,
  canDelete,
  level = 0,
  maxDepth = 2,
  onDelete,
  onDeleteComplete,
  onAddReply,
  onLoadReply,
  onChildAddReply,
}: CommentItemProps) {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  const [commentState, setCommentState] = useState<CommentNodeData>({
    id,
    content,
    authorUsername,
    authorAvatarUrl,
    isDeleted,
    isMine,
    createdAt,
    replyCount,
    parentId,
  });

  useEffect(() => {
    setCommentState({
      id,
      content,
      authorUsername,
      authorAvatarUrl,
      isDeleted,
      isMine,
      createdAt,
      replyCount,
      parentId,
    });
  }, [
    id,
    content,
    authorUsername,
    authorAvatarUrl,
    isDeleted,
    isMine,
    createdAt,
    replyCount,
    parentId,
  ]);

  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);

  const [replies, setReplies] = useState<CommentNodeData[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim() || !onAddReply) return;
    setSubmitting(true);
    try {
      const targetId =
        level >= maxDepth && commentState.parentId
          ? commentState.parentId
          : commentState.id;
      const newReply = await onAddReply(replyContent, targetId);
      newReply.isMine = true;

      setReplyContent("");
      setIsReplying(false);

      if (level >= maxDepth && onChildAddReply) {
        onChildAddReply(newReply);
      } else {
        setReplies((prev) => [newReply, ...prev]);
        setCommentState((prev) => ({
          ...prev,
          replyCount: (prev.replyCount || 0) + 1,
        }));
        setRepliesLoaded(true);
      }
    } catch (err) {
      console.error("Failed to post reply", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChildAddReply = (newReply: CommentNodeData) => {
    setReplies((prev) => [newReply, ...prev]);
    setCommentState((prev) => ({
      ...prev,
      replyCount: (prev.replyCount || 0) + 1,
    }));
    setRepliesLoaded(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    try {
      await onDelete(commentState.id);
      setConfirmDelete(false);

      const isMaxDepth = level >= maxDepth;
      const hasReplies =
        (commentState.replyCount || 0) > 0 || replies.length > 0;

      if (isMaxDepth || !hasReplies) {
        if (onDeleteComplete) {
          onDeleteComplete(commentState.id);
        }
      } else {
        setCommentState((prev) => ({
          ...prev,
          isDeleted: true,
          content: null,
        }));
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  const loadReplies = async () => {
    if (loadingReplies || !onLoadReply) return;
    setLoadingReplies(true);
    try {
      const res = await onLoadReply(commentState.id, nextCursor || undefined);

      const newItems = res.contents || [];

      if (nextCursor) {
        setReplies((prev) => [...prev, ...newItems]);
      } else {
        setReplies(newItems);
      }

      setNextCursor(res.nextCursor || null);
      setRepliesLoaded(true);
    } catch (err) {
      console.error("Failed to load replies", err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleChildDelete = (childId: string) => {
    setReplies((prev) => prev.filter((r) => r.id !== childId));
    setCommentState((prev) => ({
      ...prev,
      replyCount: Math.max(0, (prev.replyCount || 0) - 1),
    }));
  };

  return (
    <Box sx={{ mt: level === 0 ? 2 : 0 }}>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ alignItems: "flex-start", position: "relative" }}
      >
        {level > 0 && (
          <Box
            sx={{
              position: "absolute",
              left: level === 1 ? -30 : -26,
              top: 18,
              width: level === 1 ? 30 : 26,
              height: 20,
              borderBottom: "2px solid",
              borderLeft: "2px solid",
              borderColor: theme.palette.divider,
              borderBottomLeftRadius: 10,
              transform: "translateY(-100%)",
              zIndex: 0,
            }}
          />
        )}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            alignSelf: "stretch",
          }}
        >
          <Avatar
            src={commentState.authorAvatarUrl}
            sx={{
              width: level === 0 ? 36 : 28,
              height: level === 0 ? 36 : 28,
              bgcolor: "primary.main",
              fontSize: level === 0 ? "0.875rem" : "0.75rem",
              mt: 0.5,
              zIndex: 1,
            }}
          >
            {!commentState.authorAvatarUrl &&
              (commentState.isMine
                ? "Y"
                : commentState.authorUsername?.[0]?.toUpperCase() || "A")}
          </Avatar>

          {((commentState.replyCount || 0) > 0 || replies.length > 0) && (
            <Box
              sx={{
                width: "2px",
                flexGrow: 1,
                bgcolor: theme.palette.divider,
                my: 0,
              }}
            />
          )}
        </Box>

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Box
            sx={{
              bgcolor: alpha(
                theme.palette.text.primary,
                commentState.isDeleted ? 0.02 : 0.06,
              ),
              borderRadius: "18px",
              px: 2,
              py: 1.25,
              display: "inline-block",
              maxWidth: "100%",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: commentState.isDeleted
                  ? "text.disabled"
                  : "text.primary",
                mb: 0.25,
              }}
            >
              {commentState.isMine
                ? "You"
                : commentState.authorUsername || "Author"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: commentState.isDeleted
                  ? "text.disabled"
                  : "text.primary",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                fontStyle: commentState.isDeleted ? "italic" : "normal",
              }}
            >
              {commentState.isDeleted
                ? "This comment is deleted."
                : commentState.content || ""}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 0.5, px: 1.5, alignItems: "center" }}
          >
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              {formatServerDate(commentState.createdAt)}
            </Typography>

            {isAuthenticated && !commentState.isDeleted && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => setIsReplying(!isReplying)}
              >
                Reply
              </Typography>
            )}

            {isAuthenticated && canDelete && !commentState.isDeleted && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </Typography>
            )}
          </Stack>

          {isAuthenticated && (
            <Collapse in={isReplying}>
              <Box sx={{ mt: 1.5, ml: 1, minWidth: 300, maxWidth: "100%" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Write a reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  multiline
                  minRows={1}
                  maxRows={4}
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: "18px" },
                  }}
                />
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 1, justifyContent: "flex-end" }}
                >
                  <Button
                    size="small"
                    onClick={() => setIsReplying(false)}
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={!replyContent.trim() || submitting}
                    onClick={handleReply}
                    sx={{ borderRadius: 2 }}
                  >
                    Send
                  </Button>
                </Stack>
              </Box>
            </Collapse>
          )}

          {((commentState.replyCount || 0) > 0 || replies.length > 0) && (
            <Box sx={{ mt: 1, width: "100%" }}>
              {(!repliesLoaded || nextCursor) &&
                (commentState.replyCount || 0) > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      ml: 1,
                      mb: replies.length > 0 ? 1 : 0,
                      cursor: "pointer",
                      display: "inline-flex",
                    }}
                    onClick={loadReplies}
                  >
                    <MessageSquare
                      size={14}
                      color={theme.palette.text.secondary}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        "&:hover": { textDecoration: "underline" },
                      }}
                    >
                      {loadingReplies
                        ? "Loading..."
                        : nextCursor
                          ? "View more replies"
                          : `View ${commentState.replyCount} replies`}
                    </Typography>
                  </Stack>
                )}

              {replies.length > 0 && (
                <Stack spacing={1}>
                  {replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      id={reply.id}
                      content={reply.content}
                      authorUsername={reply.authorUsername}
                      authorAvatarUrl={reply.authorAvatarUrl}
                      isDeleted={reply.isDeleted}
                      isMine={reply.isMine}
                      createdAt={reply.createdAt}
                      replyCount={reply.replyCount}
                      parentId={reply.parentId || commentState.id}
                      canDelete={canDelete || reply.isMine}
                      level={level + 1}
                      maxDepth={maxDepth}
                      onDelete={onDelete}
                      onDeleteComplete={handleChildDelete}
                      onAddReply={onAddReply}
                      onLoadReply={onLoadReply}
                      onChildAddReply={handleChildAddReply}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Stack>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Comment"
        description={`Are you sure you want to delete this comment: "${
          (commentState.content || "").length > 100
            ? (commentState.content || "").substring(0, 100) + "..."
            : commentState.content || ""
        }"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </Box>
  );
}
