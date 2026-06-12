import { PostCard } from "@/components/card/post-card";
import { SkeletonCard } from "@/components/card/skeleton-card";
import { EmptyState } from "@/components/common/empty-state";
import {
  useSavedPostsInfiniteQuery,
  useUnsavePostMutation,
} from "@/lib/api/forum";
import type { SavedPostResponse } from "@/lib/type/forums";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Fade,
  Snackbar,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";

export function SavedPostsTab() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useSavedPostsInfiniteQuery();
  const { mutateAsync: unsavePostMutate } = useUnsavePostMutation();

  const rawPosts = data?.pages.flatMap((page) => page.contents) || [];

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [undoQueue, setUndoQueue] = useState<
    { post: SavedPostResponse; timeoutId: NodeJS.Timeout }[]
  >([]);

  const posts = rawPosts.filter((p) => !removedIds.has(p.id));

  const handleRemove = (postToUnsave: SavedPostResponse) => {
    setDeletingIds((prev) => new Set(prev).add(postToUnsave.id));
  };

  const finalizeRemoval = (postToRemove: SavedPostResponse) => {
    setRemovedIds((prev) => new Set(prev).add(postToRemove.id));
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(postToRemove.id);
      return next;
    });

    const timeoutId = setTimeout(async () => {
      try {
        await unsavePostMutate(postToRemove.postId);
      } catch (err) {
        console.error("Failed to unsave", err);
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
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {posts.length === 0 ? (
        <EmptyState title="You haven't saved any posts" />
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
                <PostCard post={post} tab="saved" onUnsave={handleRemove} />
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

      <Snackbar
        open={undoQueue.length > 0}
        message="Unsaved post"
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
