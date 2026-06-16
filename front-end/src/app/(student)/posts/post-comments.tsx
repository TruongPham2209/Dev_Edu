"use client";

import { CommentInput } from "@/components/common/comment-input";
import { CommentItem } from "@/components/common/comment-item";
import { EmptyState } from "@/components/common/empty-state";
import { InfiniteLoadButton } from "@/components/common/infinite-load-button";
import {
  getForumCommentReplies,
  getForumComments,
  useCreateForumCommentMutation,
  useDeleteForumCommentMutation,
} from "@/lib/api/forum";
import { CustomPaging } from "@/lib/type/api";
import type { ForumCommentResponse } from "@/lib/type/forums";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { useAuth } from "@/lib/use-auth";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

interface PostCommentsProps {
  postId: string;
  onFetchComments?: (
    postId: string,
    cursor?: string,
  ) => Promise<CustomPaging<ForumCommentResponse>>;
  onCreateComment?: (
    postId: string,
    content: string,
  ) => Promise<ForumCommentResponse>;
  onFetchReplies?: (
    commentId: string,
    cursor?: string,
  ) => Promise<CustomPaging<ForumCommentResponse>>;
  onCreateReply?: (
    commentId: string,
    content: string,
  ) => Promise<ForumCommentResponse>;
  title?: string;
  placeholder?: string;
}

export function PostComments({
  postId,
  onFetchComments,
  onCreateComment,
  onFetchReplies,
  onCreateReply,
  title,
  placeholder,
}: PostCommentsProps) {
  const { isAuthenticated, user, roles } = useAuth();
  const { handleError, showSuccess } = useApiWithToast();

  const [comments, setComments] = useState<ForumCommentResponse[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { mutateAsync: createCommentMutate } = useCreateForumCommentMutation();
  const { mutateAsync: deleteCommentMutate } = useDeleteForumCommentMutation();

  const loadComments = async (cursor?: string) => {
    try {
      const response = onFetchComments
        ? await onFetchComments(postId, cursor)
        : await getForumComments(postId, cursor);
      setComments((prev) =>
        cursor ? [...prev, ...response.contents] : response.contents,
      );
      setNextCursor(response.nextCursor ?? undefined);
      setHasMore(Boolean(response.nextCursor));
    } catch (error) {
      handleError(error, "Failed to load comments");
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
      const newComment = onCreateComment
        ? await onCreateComment(postId, commentInput.trim())
        : await createCommentMutate({
            postId,
            content: commentInput.trim(),
          });
      newComment.authorAvatarUrl = user?.avatarUrl || "";
      newComment.isMine = true;
      newComment.isDeleted = false;

      showSuccess("Comment created successfully");
      setComments((prev) => [newComment, ...prev]);
      setCommentInput("");
    } catch (error) {
      handleError(error, "Failed to create comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: "divider" }}
      id="comments"
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 3 }}>
        <MessageSquare size={24} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {title || "Comments"}
        </Typography>
      </Stack>

      <Box sx={{ mb: 4 }}>
        <CommentInput
          placeholder={
            isAuthenticated
              ? placeholder || "Write your comment..."
              : "Login to comment"
          }
          value={commentInput}
          onChange={setCommentInput}
          onSubmit={handleSubmitComment}
          disabled={!isAuthenticated}
          submitting={submitting}
          avatarColor="primary.main"
        />
      </Box>

      {loading && comments.length === 0 ? (
        <Stack spacing={3}>
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              variant="outlined"
              sx={{ borderRadius: 2, border: "none", bgcolor: "transparent" }}
            >
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "action.hover",
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        width: "30%",
                        height: 20,
                        bgcolor: "action.hover",
                        mb: 1,
                        borderRadius: 1,
                      }}
                    />
                    <Box
                      sx={{
                        width: "100%",
                        height: 60,
                        bgcolor: "action.hover",
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : comments.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 1, color: "text.secondary" }}>
          <EmptyState
            title="No comments yet!"
            subtitle="Be the first to comment."
            icon={<MessageSquare size={24} color="#599cfaff" />}
          />
        </Box>
      ) : (
        <Stack spacing={3}>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              id={comment.id}
              content={comment.content}
              authorUsername={comment.authorUsername}
              authorAvatarUrl={comment.authorAvatarUrl}
              createdAt={comment.createdAt}
              isDeleted={comment.isDeleted}
              isMine={comment.isMine}
              replyCount={comment.replyCount}
              maxDepth={1}
              canDelete={comment.isMine || roles.includes("ADMIN")}
              onAddReply={async (content, replyToId) => {
                if (onCreateReply) {
                  const res = await onCreateReply(comment.id, content);
                  return res as any;
                } else {
                  const res = await createCommentMutate({
                    postId,
                    content,
                    repliedToCommentId: replyToId,
                  });
                  return res as ForumCommentResponse;
                }
              }}
              onLoadReply={async (parentId, cursor) => {
                if (onFetchReplies) {
                  const res = await onFetchReplies(
                    parentId,
                    cursor || undefined,
                  );
                  return {
                    contents: res.contents as ForumCommentResponse[],
                    nextCursor: res.nextCursor,
                  };
                } else {
                  const res = await getForumCommentReplies(
                    parentId,
                    cursor || undefined,
                  );
                  return {
                    contents: res.contents as ForumCommentResponse[],
                    nextCursor: res.nextCursor,
                  };
                }
              }}
              onDelete={async (id) => {
                await deleteCommentMutate(id);
                await loadComments();
              }}
            />
          ))}
        </Stack>
      )}

      {hasMore && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
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
