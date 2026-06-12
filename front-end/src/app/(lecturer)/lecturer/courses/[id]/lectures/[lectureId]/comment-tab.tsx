"use client";

import { CommentInput } from "@/components/common/comment-input";
import { CommentItem } from "@/components/common/comment-item";
import { EmptyState } from "@/components/common/empty-state";
import {
  getLectureComments,
  useCreateLectureCommentMutation,
  useDeleteLectureCommentMutation,
  useInfiniteLectureCommentsQuery,
} from "@/lib/api/lectures";
import { Box, Button, CircularProgress, Divider, Stack } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface TabCommentsProps {
  lectureId: string;
}

export function TabComments({ lectureId }: TabCommentsProps) {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const {
    data: commentsData,
    isLoading: loading,
    isFetchingNextPage: loadingMore,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteLectureCommentsQuery({ lectureId });

  const { mutateAsync: createCommentMutate, isPending: submitting } =
    useCreateLectureCommentMutation();

  const { mutateAsync: deleteCommentMutate } =
    useDeleteLectureCommentMutation();

  const comments = commentsData?.pages.flatMap((page) => page.contents) || [];
  const rootComments = comments.filter((c) => !c.parentCommentId);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      await createCommentMutate({
        lectureId,
        content: newComment,
      });
      setNewComment("");
    } catch (err) {
      console.error("Failed to post comment", err);
    }
  };

  if (loading && comments.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Stack spacing={1.5}>
      {/* Post Comment Input */}
      <CommentInput
        value={newComment}
        onChange={setNewComment}
        onSubmit={handlePostComment}
        submitting={submitting}
        placeholder="Answer students' questions..."
      />

      <Divider sx={{ opacity: 0.6 }} />

      {/* Comment List */}
      <Box>
        {rootComments.length === 0 ? (
          <EmptyState
            title="No comments yet"
            subtitle="There are no comments yet"
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
                canDelete={true}
                onDelete={async (id) => {
                  await deleteCommentMutate(id);
                }}
                onDeleteComplete={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["lectures", "comments"],
                  });
                }}
                onAddReply={async (content, replyToId) => {
                  const res = await createCommentMutate({
                    lectureId,
                    content,
                    parentCommentId: replyToId,
                  });
                  return res as any;
                }}
                onLoadReply={async (parentId, nextCursor) => {
                  const res = await queryClient.fetchQuery({
                    queryKey: [
                      "lectures",
                      "comments",
                      "replies",
                      parentId,
                      nextCursor,
                    ],
                    queryFn: () =>
                      getLectureComments({
                        lectureId,
                        parentCommentId: parentId,
                        nextCursor: nextCursor || undefined,
                        size: 5,
                      }),
                  });
                  return {
                    contents: res.contents as any[],
                    nextCursor: res.nextCursor,
                  };
                }}
              />
            ))}

            {hasNextPage && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Button
                  onClick={() => fetchNextPage()}
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
