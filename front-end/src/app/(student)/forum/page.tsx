"use client";

import { PostCard } from "@/components/card/post-card";
import { EmptyState } from "@/components/common/empty-state";
import { getForumFeed, searchForumPosts } from "@/lib/api/forum";
import { PostResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
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
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ForumHero } from "./forum-hero";
import { ForumSearch } from "./forum-search";
import { TrendingTopics } from "./trending-topics";
import { CommunityGuidelines } from "./community-guidelines";

// ==========================================
// MOCK DATA GENERATION (EASY TO REMOVE LATER)
// ==========================================
const USE_MOCKS = true; // Set to false to disable mock data completely

const MOCK_DATA: PostResponse[] = [
  {
    id: "mock-1",
    title:
      "Hướng dẫn tối ưu hóa hiệu suất React App với useMemo và useCallback",
    content:
      "Trong dự án thực tế, việc re-render các component không cần thiết thường làm chậm ứng dụng đáng kể. Bài viết này chia sẻ kinh nghiệm sử dụng useMemo và useCallback đúng cách, kèm theo ví dụ cụ thể về việc profiling performance...",
    createdAt: "2024-05-15T10:00:00.000Z",
    updatedAt: "2024-05-15T10:00:00.000Z",
    authorUsername: "trongnghia",
    authorFullName: "Trần Trọng Nghĩa",
    authorAvatarUrl: null,
    thumbUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "Kinh nghiệm tối ưu performance cho ứng dụng React thực tế.",
    comments: 32,
    views: 1450,
  },
  {
    id: "mock-2",
    title: "Triển khai Clean Architecture trong Spring Boot 3",
    content:
      "Clean Architecture giúp hệ thống dễ bảo trì và mở rộng hơn. Mình vừa refactor một monolithic project sang Clean Architecture với Spring Boot 3 và Java 21. Dưới đây là cấu trúc package và cách phân tách Domain layer khỏi Infrastructure...",
    createdAt: "2024-05-14T08:30:00.000Z",
    updatedAt: "2024-05-14T08:30:00.000Z",
    authorUsername: "lecuong",
    authorFullName: "Lê Cường",
    authorAvatarUrl: null,
    thumbUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "Hướng dẫn refactor dự án Spring Boot sang Clean Architecture.",
    comments: 15,
    views: 890,
  },
  {
    id: "mock-3",
    title:
      "Tại sao truy vấn PostgreSQL bị chậm? Cách phân tích bằng EXPLAIN ANALYZE",
    content:
      "Hôm qua database production của mình bị treo vì một query quét qua 5 triệu record (Seq Scan). Bằng cách sử dụng EXPLAIN ANALYZE, mình đã phát hiện ra lỗi thiếu Composite Index. Đây là cách bạn có thể debug và tối ưu...",
    createdAt: "2024-05-13T14:15:00.000Z",
    updatedAt: "2024-05-13T14:15:00.000Z",
    authorUsername: "phamdb",
    authorFullName: "Phạm DB",
    authorAvatarUrl: null,
    thumbUrl:
      "https://images.unsplash.com/photo-1544383023-53fca390150d?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "Cách debug và tối ưu query PostgreSQL sử dụng EXPLAIN ANALYZE.",
    comments: 45,
    views: 3200,
  },
  {
    id: "mock-4",
    title: "Kinh nghiệm thực tế khi đưa Next.js App Router lên Production",
    content:
      "App Router mang lại nhiều cải tiến về Server Components, nhưng cũng đi kèm với các vấn đề về caching và hydration errors. Nếu bạn định migrate từ Pages Router sang App Router, hãy lưu ý 5 điểm cốt lõi này để tránh downtime...",
    createdAt: "2024-05-14T20:00:00.000Z",
    updatedAt: "2024-05-14T20:00:00.000Z",
    authorUsername: "hoangjs",
    authorFullName: "Hoàng JS",
    authorAvatarUrl: null,
    thumbUrl:
      "https://images.unsplash.com/photo-1544383023-53fca390150d?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "5 lưu ý quan trọng khi đưa Next.js App Router lên production.",
    comments: 18,
    views: 540,
  },
  {
    id: "mock-5",
    title:
      "Docker Compose cho môi trường phát triển (Node.js + Redis + Postgres)",
    content:
      "Setup môi trường local thủ công rất mất thời gian. Mình đã tạo một docker-compose.yml template chuẩn cho anh em làm hệ sinh thái Node. Chỉ với lệnh docker-compose up, bạn sẽ có sẵn Backend, DB và Cache...",
    createdAt: "2024-05-15T07:45:00.000Z",
    updatedAt: "2024-05-15T07:45:00.000Z",
    authorUsername: "kien_devops",
    authorFullName: "DevOps Kien",
    authorAvatarUrl: null,
    thumbUrl:
      "https://images.unsplash.com/photo-1544383023-53fca390150d?q=80&w=800&auto=format&fit=crop",
    shortDescription: "Template Docker Compose chuẩn cho Node.js fullstack.",
    comments: 22,
    views: 1100,
  },
  {
    id: "mock-6",
    title: "Áp dụng AI (Cursor / Copilot) vào workflow code hàng ngày",
    content:
      "AI đang thay đổi cách chúng ta viết code. Thay vì sợ bị thay thế, hãy học cách sử dụng GitHub Copilot và Cursor IDE để tăng x10 năng suất. Dưới đây là các prompt hiệu quả nhất để generate test cases và refactor code...",
    createdAt: "2024-05-12T09:20:00.000Z",
    updatedAt: "2024-05-12T09:20:00.000Z",
    authorUsername: "ai_enthusiast",
    authorFullName: "AI Enthusiast",
    authorAvatarUrl: null,
    thumbUrl:
      "https://images.unsplash.com/photo-1544383023-53fca390150d?q=80&w=800&auto=format&fit=crop",
    shortDescription: "Cách sử dụng AI Tools để tăng năng suất lập trình.",
    comments: 88,
    views: 5600,
  },
  {
    id: "mock-7",
    title: "TypeScript Best Practices: Đừng dùng 'any' nữa!",
    content:
      "Rất nhiều bạn mới học TS hay lạm dụng type 'any' để bypass compiler. Bài viết này tổng hợp cách sử dụng Generics, Type Guards và Utility Types (Pick, Omit) để code an toàn hơn và tận dụng sức mạnh của intellisense...",
    createdAt: "2024-05-15T08:10:00.000Z",
    updatedAt: "2024-05-15T08:10:00.000Z",
    authorUsername: "vuts",
    authorFullName: "Vũ TS",
    authorAvatarUrl: null,
    thumbUrl:
      "https://images.unsplash.com/photo-1544383023-53fca390150d?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "Tổng hợp các best practices để viết code TypeScript sạch và an toàn.",
    comments: 41,
    views: 1850,
  },
  {
    id: "mock-8",
    title: "Hệ thống Microservices có thực sự cần thiết cho startup?",
    content:
      "Đừng vội đập đi xây lại bằng Microservices chỉ vì thấy nó ngầu. Bài viết chia sẻ bài học sương máu của một startup đốt hàng chục nghìn đô tiền server vì chi phí duy trì infrastructure cho Microservices quá lớn khi chưa có user...",
    createdAt: "2024-05-11T16:50:00.000Z",
    updatedAt: "2024-05-11T16:50:00.000Z",
    authorUsername: "tech_lead",
    authorFullName: "Tech Lead",
    authorAvatarUrl: null,
    thumbUrl:
      "https://images.unsplash.com/photo-1544383023-53fca390150d?q=80&w=800&auto=format&fit=crop",
    shortDescription:
      "Bài học thực tế về việc áp dụng Microservices cho startup giai đoạn đầu.",
    comments: 115,
    views: 8900,
  },
];

export default function ForumPage() {
  const searchParams = useSearchParams();
  const { handleError } = useApiWithToast();

  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const observerTarget = useRef(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword]);

  const loadPosts = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setPosts([]); // Clear existing when doing initial load
    }

    try {
      if (USE_MOCKS) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        let filteredMocks = [...MOCK_DATA];
        if (debouncedKeyword) {
          filteredMocks = filteredMocks.filter(
            (p) =>
              p.title.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
              p.content.toLowerCase().includes(debouncedKeyword.toLowerCase()),
          );
        }

        // Mock Pagination (3 items per page)
        const PAGE_SIZE = 3;
        const currentCursorInt =
          isLoadMore && nextCursor ? parseInt(nextCursor) : 0;
        const paginatedSlice = filteredMocks.slice(
          currentCursorInt,
          currentCursorInt + PAGE_SIZE,
        );
        const nextMockCursor = currentCursorInt + PAGE_SIZE;

        setPosts((prev) =>
          isLoadMore ? [...prev, ...paginatedSlice] : paginatedSlice,
        );
        setHasMore(nextMockCursor < filteredMocks.length);
        setNextCursor(nextMockCursor.toString());
      } else {
        // Real API Logic
        const currentCursor = isLoadMore ? nextCursor : undefined;
        let response;
        if (debouncedKeyword) {
          response = await searchForumPosts(debouncedKeyword, currentCursor);
        } else {
          response = await getForumFeed(currentCursor);
        }

        setPosts((prev) =>
          isLoadMore ? [...prev, ...response.contents] : response.contents,
        );
        setNextCursor(response.nextCursor ?? undefined);
        setHasMore(!!response.nextCursor);
      }
    } catch (error) {
      handleError(error, "Failed to load posts");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedKeyword]);

  // Infinite Scroll Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadPosts(true);
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
  }, [hasMore, loading, loadingMore, nextCursor]);

  const handleSearch = (val: string) => {
    setKeyword(val);
    setDebouncedKeyword(val);
  };

  return (
    <Stack spacing={0} sx={{ pb: 10 }}>
      {/* 1. HERO SECTION */}
      <ForumHero />

      {/* 2. SEARCH SECTION */}
      <ForumSearch
        keyword={keyword}
        onChangeKeyword={setKeyword}
        onSearch={handleSearch}
      />

      {/* 3. MAIN CONTENT GRID (Feed + Sidebar) */}
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
              alignItems: "center",
              justifyContent: "space-between",
              mb: 3,
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
              }}
            >
              <TrendingUp size={24} color="#0284c7" />
              Latest Discussions
            </Typography>
            <Button
              variant="contained"
              startIcon={<Sparkles size={16} />}
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

          {loading ? (
            <Stack spacing={3}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Card
                  key={index}
                  sx={{
                    borderRadius: 4,
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
                borderRadius: 6,
                border: "1px dashed #cbd5e1",
              }}
            >
              <MessageSquare
                size={48}
                color="#94a3b8"
                style={{ margin: "0 auto 16px" }}
              />
              <EmptyState
                title="No posts found"
                subtitle="Try searching with different keywords or be the first to share on this topic."
              />
            </Box>
          ) : (
            <Stack spacing={3}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {/* Infinite Scroll Target */}
              {hasMore && (
                <Box
                  ref={observerTarget}
                  sx={{ py: 4, display: "flex", justifyContent: "center" }}
                >
                  {loadingMore ? (
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

        {/* RIGHT COLUMN: Sidebar (Trending/Stats) */}
        <Box sx={{ width: { xs: "100%", lg: 320 }, flexShrink: 0 }}>
          <Box sx={{ position: "sticky", top: 100 }}>
            {/* Pinned/Trending Card */}
            <TrendingTopics onSelectTopic={handleSearch} />

            {/* Guidelines Card */}
            <CommunityGuidelines />
          </Box>
        </Box>
      </Box>
    </Stack>
  );
}
