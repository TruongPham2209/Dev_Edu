import { PostCard } from "@/components/card/post-card";
import { SkeletonCard } from "@/components/card/skeleton-card";
import { EmptyState } from "@/components/common/empty-state";
import { PostHistoryModal } from "@/components/dialog/post-history";
import {
  deleteForumPost,
  updateForumPost,
  createForumPost,
} from "@/lib/api/forum";
import { getPreSignedUploadUrl } from "@/lib/api/files";
import {
  CustomPaging,
  PostResponse,
  PostStatus,
  PostRequest,
} from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Plus, Sparkles } from "lucide-react";
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Fade,
  Snackbar,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { PostFormDialog } from "../../../components/dialog/post-form";

// Mock API
const MOCK_POSTS: PostResponse[] = Array.from({ length: 15 }).map((_, i) => ({
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
  status: (["APPROVED", "PENDING", "REJECTED"] as PostStatus[])[
    Math.floor(Math.random() * 3)
  ],
}));

const mockGetPostedPosts = async (
  cursor?: string,
): Promise<CustomPaging<PostResponse>> => {
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
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Modals state
  const [editPost, setEditPost] = useState<PostResponse | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [historyPost, setHistoryPost] = useState<PostResponse | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const { handleError, showSuccess } = useApiWithToast();

  // Undo Delete Queue
  const [undoQueue, setUndoQueue] = useState<
    { post: PostResponse; timeoutId: NodeJS.Timeout }[]
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

  const handleRemove = (postToRemove: PostResponse) => {
    setDeletingIds((prev) => new Set(prev).add(postToRemove.id));
  };

  const finalizeRemoval = (postToRemove: PostResponse) => {
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
        const updated = await updateForumPost(finalPayload);
        setPosts((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p)),
        );
        showSuccess("Post updated successfully");
      } else {
        const created = await createForumPost(finalPayload);
        setPosts((prev) => [created, ...prev]);
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<Sparkles size={16} />}
          onClick={() => setIsCreatingPost(true)}
          sx={{
            bgcolor: "#0f172a",
            borderRadius: 50,
            px: 3,
            textTransform: "none",
            fontWeight: 600,
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
        {loadingMore && <CircularProgress size={24} />}
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
