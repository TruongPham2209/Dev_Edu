import { PostCard } from "@/components/card/post-card";
import { SkeletonCard } from "@/components/card/skeleton-card";
import { EmptyState } from "@/components/common/empty-state";
import { getSavedPosts, unsavePost } from "@/lib/api/forum";
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
  const [posts, setPosts] = useState<SavedPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [undoQueue, setUndoQueue] = useState<
    { post: SavedPostResponse; timeoutId: NodeJS.Timeout }[]
  >([]);

  useEffect(() => {
    let mounted = true;
    getSavedPosts()
      .then((res) => {
        if (mounted) {
          setPosts(res.contents);
          setNextCursor(res.nextCursor || null);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getSavedPosts(nextCursor);
      setPosts((prev) => [...prev, ...(res.contents || [])]);
      setNextCursor(res.nextCursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRemove = (postToUnsave: SavedPostResponse) => {
    setDeletingIds((prev) => new Set(prev).add(postToUnsave.id));
  };

  const finalizeRemoval = (postToRemove: SavedPostResponse) => {
    setPosts((prev) => prev.filter((p) => p.id !== postToRemove.id));
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(postToRemove.id);
      return next;
    });

    const timeoutId = setTimeout(async () => {
      try {
        await unsavePost(postToRemove.postId);
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

    setPosts((prev) => {
      return [lastItem.post, ...prev];
    });

    setUndoQueue((prev) => prev.slice(0, -1));
  };

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!nextCursor || loadingMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore]);

  if (loading) {
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
        {loadingMore && <CircularProgress size={24} />}
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
