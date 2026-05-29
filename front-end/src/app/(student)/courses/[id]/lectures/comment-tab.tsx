"use client";

import { CommentInput } from "@/components/common/comment-input";
import { CommentItem } from "@/components/common/comment-item";
import { EmptyState } from "@/components/common/empty-state";
import {
  createLectureComment,
  getLectureComments,
  deleteLectureComment,
} from "@/lib/api/lectures";
import { LectureCommentResponse } from "@/lib/api/types";
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  useTheme,
} from "@mui/material";
import { useEffect, useState } from "react";

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
      <CommentInput
        value={newComment}
        onChange={setNewComment}
        onSubmit={handlePostComment}
        submitting={submitting}
        placeholder="Share your thoughts or ask questions about this lecture..."
      />

      <Divider sx={{ opacity: 0.6 }} />

      {/* Comment List */}
      <Box>
        {rootComments.length === 0 ? (
          <EmptyState
            title="No comments yet"
            subtitle="Be the first to ask questions or share your thoughts on this lecture."
          />
        ) : (
          <Stack spacing={1}>
            {rootComments.map((comment) => (
              <CommentItem
                key={comment.id}
                id={comment.id}
                content={comment.content}
                // @ts-ignore - Assuming LectureCommentResponse might have author info later, fallback if not
                authorUsername={comment.authorUsername}
                // @ts-ignore
                authorAvatar={comment.authorAvatar}
                isDeleted={comment.isDeleted}
                isMine={comment.isMine}
                createdAt={comment.createdAt}
                replyCount={comment.replyCount}
                parentId={comment.parentCommentId || ""}
                canDelete={comment.isMine}
                onDelete={async (id) => {
                  await deleteLectureComment(id);
                }}
                onDeleteComplete={() => fetchComments()}
                onAddReply={async (content, replyToId) => {
                  const res = await createLectureComment({
                    lectureId,
                    content,
                    parentCommentId: replyToId,
                  });
                  return res as any;
                }}
                onLoadReply={async (parentId, nextCursor) => {
                  const res = await getLectureComments({
                    lectureId,
                    parentCommentId: parentId,
                    nextCursor: nextCursor || undefined,
                    size: 5,
                  });
                  return {
                    contents: res.contents as any[],
                    nextCursor: res.nextCursor,
                  };
                }}
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
                  Load more comments
                </Button>
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
