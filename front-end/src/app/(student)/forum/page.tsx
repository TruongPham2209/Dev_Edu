"use client";

import { PostCard } from "@/components/card/post-card";
import { EmptyState } from "@/components/common/empty-state";
import { PostFormDialog } from "@/components/dialog/post-form";
import { getPreSignedUploadUrl } from "@/lib/api/files";
import {
  useCreateForumPostMutation,
  useForumFeedInfiniteQuery,
  useSearchForumPostsInfiniteQuery,
} from "@/lib/api/forum";
import type { PostRequest } from "@/lib/type/forums";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { useAuth } from "@/lib/use-auth";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { MessageSquare, Sparkles, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CommunityGuidelines } from "./community-guidelines";
import { ForumHero } from "./forum-hero";
import { ForumSearch } from "./forum-search";
import { TrendingTopics } from "./trending-topics";

export default function ForumPage() {
  const { handleError, showSuccess } = useApiWithToast();
  const { isAuthenticated, roles } = useAuth();
  const router = useRouter();

  const createPostMutation = useCreateForumPostMutation();

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const observerTarget = useRef<HTMLDivElement | null>(null);

  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [savingPost, setSavingPost] = useState(false);

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      setIsCreatingPost(true);
    }
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

      await createPostMutation.mutateAsync(finalPayload);
      showSuccess("Post created successfully");
      setIsCreatingPost(false);
    } catch (error) {
      handleError(error, "Failed to save post");
    } finally {
      setSavingPost(false);
    }
  };

  // Debounce search and trim
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const feedQuery = useForumFeedInfiniteQuery({
    enabled: !debouncedKeyword,
  });

  const searchQuery = useSearchForumPostsInfiniteQuery(debouncedKeyword, {
    enabled: !!debouncedKeyword,
  });

  const isSearching = !!debouncedKeyword;
  const activeQuery = isSearching ? searchQuery : feedQuery;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = activeQuery;

  useEffect(() => {
    if (isError && error) {
      handleError(error, "Failed to load posts");
    }
  }, [isError, error, handleError]);

  const posts = data?.pages.flatMap((page) => page.contents) || [];

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearch = (val: string) => {
    setKeyword(val);
    setDebouncedKeyword(val.trim());
  };

  return (
    <Stack spacing={0} sx={{ pb: { xs: 6, sm: 10 } }}>
      {/* 1. HERO SECTION (Desktop & Tablet md+ only) */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <ForumHero />
      </Box>

      {/* 2. SEARCH SECTION */}
      <ForumSearch
        keyword={keyword}
        onChangeKeyword={setKeyword}
        onSearch={handleSearch}
      />

      {/* 3. MOBILE ONLY: TRENDING TOPICS AT TOP */}
      <Box sx={{ display: { xs: "block", lg: "none" }, mb: { xs: 3, sm: 4 } }}>
        <TrendingTopics onSelectTopic={handleSearch} />
      </Box>

      {/* 4. MAIN CONTENT GRID (Feed + Sidebar) */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 4, lg: 6 },
        }}
      >
        {/* LEFT COLUMN: Posts Feed */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
              gap: { xs: 2, sm: 0 },
              mb: { xs: 2.5, sm: 3 },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: "#0f172a",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
              }}
            >
              <TrendingUp size={22} color="#0284c7" />
              Latest Discussions
            </Typography>
            <Button
              variant="contained"
              startIcon={<Sparkles size={16} />}
              onClick={handleCreatePost}
              sx={{
                bgcolor: "#0f172a",
                borderRadius: 50,
                px: { xs: 3, sm: 3 },
                py: { xs: 1, sm: 0.8 },
                width: { xs: "100%", sm: "auto" },
                justifyContent: "center",
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

          {isLoading ? (
            <Stack spacing={3}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  sx={{
                    borderRadius: 1,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
                    border: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton width="30%" height={24} />
                        <Skeleton width="15%" height={16} />
                      </Box>
                    </Box>
                    <Skeleton width="90%" height={32} sx={{ mb: 1 }} />
                    <Skeleton width="100%" height={20} />
                    <Skeleton width="80%" height={20} />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : posts.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 10,
                bgcolor: "#ffffff",
                borderRadius: 2,
                border: "1px dashed #cbd5e1",
              }}
            >
              <EmptyState
                title="No posts found"
                subtitle="Try searching with different keywords or be the first to share on this topic."
                icon={
                  <MessageSquare
                    size={48}
                    color="#599cfaff"
                    style={{ padding: "8px" }}
                  />
                }
                actionLabel={debouncedKeyword ? "Clear Search" : undefined}
                onAction={debouncedKeyword ? () => handleSearch("") : undefined}
              />
            </Box>
          ) : (
            <Stack spacing={3}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} showStatus={false} />
              ))}

              {/* Infinite Scroll Target */}
              {hasNextPage && (
                <Box
                  ref={observerTarget}
                  sx={{ py: 4, display: "flex", justifyContent: "center" }}
                >
                  {isFetchingNextPage ? (
                    <CircularProgress size={30} sx={{ color: "#0284c7" }} />
                  ) : (
                    <Typography variant="body2" sx={{ color: "transparent" }}>
                      Loading more...
                    </Typography>
                  )}
                </Box>
              )}
            </Stack>
          )}
        </Box>

        {/* RIGHT COLUMN: Sidebar (Desktop lg+ only) */}
        <Box
          sx={{
            width: { xs: "100%", lg: 320 },
            flexShrink: 0,
            display: { xs: "none", lg: "block" },
          }}
        >
          <Box sx={{ position: "sticky", top: 140 }}>
            {/* Pinned/Trending Card */}
            <TrendingTopics onSelectTopic={handleSearch} />

            {/* Guidelines Card */}
            <CommunityGuidelines />
          </Box>
        </Box>
      </Box>

      {isCreatingPost && (
        <PostFormDialog
          open={isCreatingPost}
          initialValue={{
            postId: null,
            thumbObjectKey: "",
            title: "",
            shortDescription: "",
            content: "",
          }}
          saving={savingPost}
          onClose={() => setIsCreatingPost(false)}
          onSave={handleSavePost}
        />
      )}
    </Stack>
  );
}
