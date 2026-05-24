import { PostCard } from "@/components/card/post-card";
import { EmptyState } from "@/components/common/empty-state";
import { SkeletonCard } from "@/components/common/skeleton-card";
import { getSavedPosts, unsavePost } from "@/lib/api/forum";
import { PostResponse } from "@/lib/api/types";
import { Box, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";

function mapSavedPostToPost(saved: any): PostResponse {
  return {
    id: saved.postId,
    title: saved.title,
    authorUsername: "Ẩn danh",
    authorFullName: "Người đăng",
    authorAvatarUrl: null,
    thumbUrl: saved.thumbUrl,
    shortDescription: saved.shortDescription,
    content: saved.shortDescription,
    views: 0,
    comments: 0,
    createdAt: saved.savedAt,
    updatedAt: saved.savedAt,
    status: "APPROVED",
  };
}

export function SavedPostsTab() {
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getSavedPosts()
      .then((res) => {
        if (mounted) {
          const mappedPosts = res.contents.map(mapSavedPostToPost);
          setPosts(mappedPosts);
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
      const mappedPosts = res.contents.map(mapSavedPostToPost);
      setPosts((prev) => [...prev, ...mappedPosts]);
      setNextCursor(res.nextCursor || null);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUnsave = async (postToUnsave: PostResponse) => {
    // Optimistic update
    setPosts((prev) => prev.filter((p) => p.id !== postToUnsave.id));
    try {
      await unsavePost(postToUnsave.id);
    } catch (err) {
      console.error("Failed to unsave", err);
      // Depending on requirement, we could revert the optimistic update here
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
      </Box>
    );
  }

  if (posts.length === 0) {
    return <EmptyState title="Bạn chưa lưu bài viết nào" />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          tab="saved"
          onUnsave={handleUnsave}
        />
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
    </Box>
  );
}
