import { EmptyState } from "@/components/common/empty-state";
import { SkeletonCard } from "@/components/common/skeleton-card";
import { ExtendedPostResponse, PostCard } from "@/components/post/post-card";
import { deleteForumPost } from "@/lib/api/forum";
import { CustomPaging, PostStatus } from "@/lib/api/types";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Fade,
  Snackbar,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { EditPostModal } from "./edit-post-modal";
import { PostHistoryModal } from "./post-history-modal";

// Mock API
const MOCK_POSTS: ExtendedPostResponse[] = Array.from({ length: 15 }).map(
  (_, i) => ({
    id: `mock-post-${i}`,
    title: `Bài viết mẫu ${i + 1}`,
    authorUsername: "current_user",
    authorFullName: "Current User",
    authorAvatarUrl: null,
    thumbUrl: "https://via.placeholder.com/150",
    shortDescription: "Mô tả ngắn của bài viết mẫu...",
    content: "Nội dung chi tiết của bài viết mẫu này sẽ hiển thị ở đây.",
    views: Math.floor(Math.random() * 1000),
    comments: Math.floor(Math.random() * 100),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ["Học tập", "Chia sẻ"],
    status: (["APPROVED", "PENDING", "REJECTED"] as PostStatus[])[
      Math.floor(Math.random() * 3)
    ],
  }),
);

const mockGetPostedPosts = async (
  cursor?: string,
): Promise<CustomPaging<ExtendedPostResponse>> => {
  await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate delay
  const pageSize = 5;
  const startIndex = cursor ? parseInt(cursor) : 0;
  const nextIndex = startIndex + pageSize;
  const contents = MOCK_POSTS.slice(startIndex, nextIndex);

  return {
    contents,
    currentPage: Math.floor(startIndex / pageSize),
    pageSize,
    totalElements: MOCK_POSTS.length,
    totalPages: Math.ceil(MOCK_POSTS.length / pageSize),
    nextCursor: nextIndex < MOCK_POSTS.length ? String(nextIndex) : null,
  };
};

export function PostedPostsTab() {
  const [posts, setPosts] = useState<ExtendedPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Modals state
  const [editPost, setEditPost] = useState<ExtendedPostResponse | null>(null);
  const [historyPost, setHistoryPost] = useState<ExtendedPostResponse | null>(
    null,
  );
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  // Undo Delete Queue
  const [undoQueue, setUndoQueue] = useState<
    { post: ExtendedPostResponse; timeoutId: NodeJS.Timeout }[]
  >([]);

  useEffect(() => {
    let mounted = true;
    mockGetPostedPosts().then((res) => {
      if (mounted) {
        setPosts(res.contents);
        setNextCursor(res.nextCursor || null);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await mockGetPostedPosts(nextCursor);
      setPosts((prev) => [...prev, ...res.contents]);
      setNextCursor(res.nextCursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleRemove = (postToRemove: ExtendedPostResponse) => {
    setDeletingIds((prev) => new Set(prev).add(postToRemove.id));
  };

  const finalizeRemoval = (postToRemove: ExtendedPostResponse) => {
    setPosts((prev) => prev.filter((p) => p.id !== postToRemove.id));
    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(postToRemove.id);
      return next;
    });

    const timeoutId = setTimeout(async () => {
      // Actually delete from API if not undone
      try {
        if (!postToRemove.id.startsWith("mock-")) {
          await deleteForumPost(postToRemove.id);
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

    setPosts((prev) => {
      // Re-insert at top or original position. For simplicity, just append to top.
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
        <SkeletonCard />
      </Box>
    );
  }

  if (posts.length === 0) {
    return <EmptyState title="Bạn chưa đăng bài viết nào" />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {posts.map((post) => (
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
      ))}

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

      {editPost && (
        <EditPostModal
          open={!!editPost}
          post={editPost}
          onClose={() => setEditPost(null)}
          onSuccess={(updatedPost: ExtendedPostResponse) => {
            setPosts((prev) =>
              prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)),
            );
            setEditPost(null);
          }}
        />
      )}

      {historyPost && (
        <PostHistoryModal
          open={!!historyPost}
          post={historyPost}
          onClose={() => setHistoryPost(null)}
        />
      )}

      <Snackbar
        open={undoQueue.length > 0}
        message="Đã xóa bài viết"
        action={
          <Button color="secondary" size="small" onClick={handleUndo}>
            Hoàn tác
          </Button>
        }
        sx={{ bottom: { xs: 90, sm: 24 } }}
      />
    </Box>
  );
}
