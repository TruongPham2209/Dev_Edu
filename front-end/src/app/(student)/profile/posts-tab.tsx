import { PostCard } from "@/components/card/post-card";
import { SkeletonCard } from "@/components/card/skeleton-card";
import { EmptyState } from "@/components/common/empty-state";
import { PostHistoryModal } from "@/components/dialog/post-history/page";
import { getPreSignedUploadUrl } from "@/lib/api/files";
import {
  useCreateForumPostMutation,
  useDeleteForumPostMutation,
  useDeletePostVersionMutation,
  useUpdateForumPostMutation,
} from "@/lib/api/forum";
import type { PostRequest, PostResponse } from "@/lib/type/forums";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Fade,
  Snackbar,
} from "@mui/material";
import { Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PostFormDialog } from "../../../components/dialog/post-form";

import {
  FilterItem,
  FilterSelect,
} from "@/components/common/form/filter-select";
import { usePostedPostsInfiniteQuery } from "@/lib/api/forum";
import { PostStatus } from "@/lib/type/enum";

const FILTER_ITEMS: FilterItem[] = [
  { id: "APPROVED", title: "Approved" },
  { id: "PENDING", title: "Pending" },
  { id: "REJECTED", title: "Rejected" },
];

export function PostedPostsTab() {
  const [statusFilter, setStatusFilter] = useState<string>("APPROVED");
  const [debouncedStatus, setDebouncedStatus] = useState<string>("APPROVED");

  const { mutateAsync: createPostMutate } = useCreateForumPostMutation();
  const { mutateAsync: updatePostMutate } = useUpdateForumPostMutation();
  const { mutateAsync: deletePostMutate } = useDeleteForumPostMutation();
  const { mutateAsync: deleteVersionMutate } = useDeletePostVersionMutation();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedStatus(statusFilter);
    }, 500);
    return () => clearTimeout(handler);
  }, [statusFilter]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    usePostedPostsInfiniteQuery(debouncedStatus as PostStatus);

  const rawPosts = data?.pages.flatMap((page) => page.contents) || [];

  // Modals state
  const [editPost, setEditPost] = useState<PostResponse | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [historyPost, setHistoryPost] = useState<PostResponse | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const { handleError, showSuccess } = useApiWithToast();

  // Undo Delete Queue
  const [undoQueue, setUndoQueue] = useState<
    { post: PostResponse; timeoutId: NodeJS.Timeout }[]
  >([]);

  const posts = rawPosts.filter((p) => !removedIds.has(p.id));

  const handleRemove = (postToRemove: PostResponse) => {
    setDeletingIds((prev) => new Set(prev).add(postToRemove.id));
  };

  const finalizeRemoval = (postToRemove: PostResponse) => {
    setRemovedIds((prev) => new Set(prev).add(postToRemove.id));
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(postToRemove.id);
      return next;
    });

    const timeoutId = setTimeout(async () => {
      // Actually delete from API if not undone
      try {
        if (postToRemove.status === "APPROVED") {
          await deletePostMutate(postToRemove.id);
        } else {
          await deleteVersionMutate(postToRemove.id);
        }
      } catch (e) {
        console.error("Delete failed", e);
      }
      setUndoQueue((prev) => prev.filter((q) => q.post.id !== postToRemove.id));
    }, 5000);

    setUndoQueue((prev) => [...prev, { post: postToRemove, timeoutId }]);
  };

  const handleUndo = () => {
    if (undoQueue.length === 0) return;

    const lastItem = undoQueue[undoQueue.length - 1];
    clearTimeout(lastItem.timeoutId);

    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.delete(lastItem.post.id);
      return next;
    });

    setUndoQueue((prev) => prev.slice(0, -1));
  };

  const handleSavePost = async (payload: PostRequest, file: File | null) => {
    setSavingPost(true);
    try {
      let finalPayload = { ...payload };

      if (file) {
        const presignRes = await getPreSignedUploadUrl({
          fileName: file.name,
          contentType: file.type,
          fileSize: file.size,
          isPublic: true,
        });

        if (!presignRes.uploadUrl) {
          throw new Error("Failed to get upload URL");
        }

        await fetch(presignRes.uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        finalPayload.thumbObjectKey = presignRes.objectKey;
      }

      if (finalPayload.postId) {
        await updatePostMutate(finalPayload);
        showSuccess("Post updated successfully");
      } else {
        await createPostMutate(finalPayload);
        showSuccess("Post created successfully");
      }
      setEditPost(null);
      setIsCreatingPost(false);
    } catch (error) {
      handleError(error, "Failed to save post");
    } finally {
      setSavingPost(false);
    }
  };

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1.5,
          mb: { xs: 1, sm: 2 },
        }}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          items={FILTER_ITEMS}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<Sparkles size={16} />}
          onClick={() => setIsCreatingPost(true)}
          sx={{
            bgcolor: "#0f172a",
            borderRadius: 50,
            px: { xs: 2, sm: 3 },
            py: 0.8,
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: "0.825rem", sm: "0.875rem" },
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#1e293b",
              boxShadow: "0 4px 12px rgba(15,23,42,0.2)",
            },
          }}
        >
          Create Post
        </Button>
      </Box>

      {posts.length === 0 ? (
        <EmptyState title="You haven't posted anything." />
      ) : (
        posts.map((post) => (
          <Collapse
            key={post.id}
            in={!deletingIds.has(post.id)}
            onExited={() => finalizeRemoval(post)}
            timeout={400}
          >
            <Fade in={!deletingIds.has(post.id)} timeout={400}>
              <Box sx={{ pb: 2 }}>
                <PostCard
                  post={post}
                  tab="posted"
                  onEdit={setEditPost}
                  onHistory={setHistoryPost}
                  onRemove={handleRemove}
                />
              </Box>
            </Fade>
          </Collapse>
        ))
      )}

      {/* Infinite Scroll Sentinel */}
      <Box
        ref={sentinelRef}
        sx={{
          height: 40,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isFetchingNextPage && <CircularProgress size={24} />}
      </Box>

      {(editPost || isCreatingPost) && (
        <PostFormDialog
          open={!!editPost || isCreatingPost}
          initialValue={
            editPost
              ? {
                  postId: editPost.id,
                  thumbObjectKey: editPost.thumbUrl
                    ? editPost.thumbUrl.split("/").pop() || "existing-thumb"
                    : "existing-thumb",
                  title: editPost.title,
                  shortDescription: editPost.shortDescription,
                  content: editPost.content,
                }
              : {
                  postId: null,
                  thumbObjectKey: "",
                  title: "",
                  shortDescription: "",
                  content: "",
                }
          }
          editingPost={editPost}
          saving={savingPost}
          onClose={() => {
            setEditPost(null);
            setIsCreatingPost(false);
          }}
          onSave={handleSavePost}
        />
      )}

      {historyPost && (
        <PostHistoryModal
          open={!!historyPost}
          postId={historyPost.id}
          onClose={() => setHistoryPost(null)}
        />
      )}

      <Snackbar
        open={undoQueue.length > 0}
        message="Deleted post"
        action={
          <Button color="secondary" size="small" onClick={handleUndo}>
            Undo
          </Button>
        }
        sx={{ bottom: { xs: 90, sm: 24 } }}
      />
    </Box>
  );
}
