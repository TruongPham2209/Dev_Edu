"use client";

import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Button,
  InputAdornment,
  Fade,
  Chip,
  CircularProgress
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { getForumFeed, searchForumPosts } from "@/lib/api/forum";
import { PostCard, type ExtendedPostResponse } from "@/components/post/post-card";
import { EmptyState } from "@/components/common/empty-state";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { 
  Search, 
  MessageSquare, 
  Users, 
  TrendingUp,
  Sparkles,
  ChevronRight,
  Flame,
  Clock
} from "lucide-react";

// ==========================================
// MOCK DATA GENERATION (EASY TO REMOVE LATER)
// ==========================================
const USE_MOCKS = true; // Set to false to disable mock data completely

const MOCK_DATA = [
  {
    id: "mock-1",
    title: "Hướng dẫn tối ưu hóa hiệu suất React App với useMemo và useCallback",
    content: "Trong dự án thực tế, việc re-render các component không cần thiết thường làm chậm ứng dụng đáng kể. Bài viết này chia sẻ kinh nghiệm sử dụng useMemo và useCallback đúng cách, kèm theo ví dụ cụ thể về việc profiling performance...",
    createdAt: "2024-05-15T10:00:00.000Z",
    updatedAt: "2024-05-15T10:00:00.000Z",
    authorUsername: "trongnghia",
    authorFullName: "Trần Trọng Nghĩa",
    authorAvatarUrl: null,
    thumbUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
    shortDescription: "Kinh nghiệm tối ưu performance cho ứng dụng React thực tế.",
    tags: ["ReactJS", "Performance", "Frontend"],
    likes: 124,
    comments: 32,
    views: 1450,
  },
  {
    id: "mock-2",
    title: "Triển khai Clean Architecture trong Spring Boot 3",
    content: "Clean Architecture giúp hệ thống dễ bảo trì và mở rộng hơn. Mình vừa refactor một monolithic project sang Clean Architecture với Spring Boot 3 và Java 21. Dưới đây là cấu trúc package và cách phân tách Domain layer khỏi Infrastructure...",
    createdAt: "2024-05-14T08:30:00.000Z",
    updatedAt: "2024-05-14T08:30:00.000Z",
    authorUsername: "lecuong",
    authorFullName: "Lê Cường",
    authorAvatarUrl: null,
    thumbUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    shortDescription: "Hướng dẫn refactor dự án Spring Boot sang Clean Architecture.",
    tags: ["Spring Boot", "Architecture", "Java"],
    likes: 89,
    comments: 15,
    views: 890,
  },
  {
    id: "mock-3",
    title: "Tại sao truy vấn PostgreSQL bị chậm? Cách phân tích bằng EXPLAIN ANALYZE",
    content: "Hôm qua database production của mình bị treo vì một query quét qua 5 triệu record (Seq Scan). Bằng cách sử dụng EXPLAIN ANALYZE, mình đã phát hiện ra lỗi thiếu Composite Index. Đây là cách bạn có thể debug và tối ưu...",
    createdAt: "2024-05-13T14:15:00.000Z",
    updatedAt: "2024-05-13T14:15:00.000Z",
    authorUsername: "phamdb",
    authorFullName: "Phạm DB",
    authorAvatarUrl: null,
    thumbUrl: "https://images.unsplash.com/photo-1544383023-53fca390150d?q=80&w=800&auto=format&fit=crop",
    shortDescription: "Cách debug và tối ưu query PostgreSQL sử dụng EXPLAIN ANALYZE.",
    tags: ["PostgreSQL", "Database", "Optimization"],
    likes: 210,
    comments: 45,
    views: 3200,
  },
  {
    id: "mock-4",
    title: "Kinh nghiệm thực tế khi đưa Next.js App Router lên Production",
    content: "App Router mang lại nhiều cải tiến về Server Components, nhưng cũng đi kèm với các vấn đề về caching và hydration errors. Nếu bạn định migrate từ Pages Router sang App Router, hãy lưu ý 5 điểm cốt lõi này để tránh downtime...",
    createdAt: "2024-05-14T20:00:00.000Z",
    updatedAt: "2024-05-14T20:00:00.000Z",
    authorUsername: "hoangjs",
    authorFullName: "Hoàng JS",
    authorAvatarUrl: null,
    shortDescription: "5 lưu ý quan trọng khi đưa Next.js App Router lên production.",
    tags: ["Next.js", "React", "Production"],
    likes: 67,
    comments: 18,
    views: 540,
  },
  {
    id: "mock-5",
    title: "Docker Compose cho môi trường phát triển (Node.js + Redis + Postgres)",
    content: "Setup môi trường local thủ công rất mất thời gian. Mình đã tạo một docker-compose.yml template chuẩn cho anh em làm hệ sinh thái Node. Chỉ với lệnh docker-compose up, bạn sẽ có sẵn Backend, DB và Cache...",
    createdAt: "2024-05-15T07:45:00.000Z",
    updatedAt: "2024-05-15T07:45:00.000Z",
    authorUsername: "kien_devops",
    authorFullName: "DevOps Kien",
    authorAvatarUrl: null,
    shortDescription: "Template Docker Compose chuẩn cho Node.js fullstack.",
    tags: ["Docker", "Node.js", "DevOps"],
    likes: 156,
    comments: 22,
    views: 1100,
  },
  {
    id: "mock-6",
    title: "Áp dụng AI (Cursor / Copilot) vào workflow code hàng ngày",
    content: "AI đang thay đổi cách chúng ta viết code. Thay vì sợ bị thay thế, hãy học cách sử dụng GitHub Copilot và Cursor IDE để tăng x10 năng suất. Dưới đây là các prompt hiệu quả nhất để generate test cases và refactor code...",
    createdAt: "2024-05-12T09:20:00.000Z",
    updatedAt: "2024-05-12T09:20:00.000Z",
    authorUsername: "ai_enthusiast",
    authorFullName: "AI Enthusiast",
    authorAvatarUrl: null,
    shortDescription: "Cách sử dụng AI Tools để tăng năng suất lập trình.",
    tags: ["AI", "Productivity", "Tools"],
    likes: 340,
    comments: 88,
    views: 5600,
  },
  {
    id: "mock-7",
    title: "TypeScript Best Practices: Đừng dùng 'any' nữa!",
    content: "Rất nhiều bạn mới học TS hay lạm dụng type 'any' để bypass compiler. Bài viết này tổng hợp cách sử dụng Generics, Type Guards và Utility Types (Pick, Omit) để code an toàn hơn và tận dụng sức mạnh của intellisense...",
    createdAt: "2024-05-15T08:10:00.000Z",
    updatedAt: "2024-05-15T08:10:00.000Z",
    authorUsername: "vuts",
    authorFullName: "Vũ TS",
    authorAvatarUrl: null,
    shortDescription: "Tổng hợp các best practices để viết code TypeScript sạch và an toàn.",
    tags: ["TypeScript", "Best Practices", "JavaScript"],
    likes: 198,
    comments: 41,
    views: 1850,
  },
  {
    id: "mock-8",
    title: "Hệ thống Microservices có thực sự cần thiết cho startup?",
    content: "Đừng vội đập đi xây lại bằng Microservices chỉ vì thấy nó ngầu. Bài viết chia sẻ bài học sương máu của một startup đốt hàng chục nghìn đô tiền server vì chi phí duy trì infrastructure cho Microservices quá lớn khi chưa có user...",
    createdAt: "2024-05-11T16:50:00.000Z",
    updatedAt: "2024-05-11T16:50:00.000Z",
    authorUsername: "tech_lead",
    authorFullName: "Tech Lead",
    authorAvatarUrl: null,
    shortDescription: "Bài học thực tế về việc áp dụng Microservices cho startup giai đoạn đầu.",
    tags: ["Architecture", "Microservices", "Startup"],
    likes: 412,
    comments: 115,
    views: 8900,
  }
] as ExtendedPostResponse[];

export default function ForumPage() {
  const searchParams = useSearchParams();
  const { handleError } = useApiWithToast();
  
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  const [posts, setPosts] = useState<ExtendedPostResponse[]>([]);
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
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let filteredMocks = [...MOCK_DATA];
        if (debouncedKeyword) {
          filteredMocks = filteredMocks.filter(p => 
            p.title.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
            p.content.toLowerCase().includes(debouncedKeyword.toLowerCase()) ||
            p.tags?.some(t => t.toLowerCase().includes(debouncedKeyword.toLowerCase()))
          );
        }

        // Mock Pagination (3 items per page)
        const PAGE_SIZE = 3;
        const currentCursorInt = isLoadMore && nextCursor ? parseInt(nextCursor) : 0;
        const paginatedSlice = filteredMocks.slice(currentCursorInt, currentCursorInt + PAGE_SIZE);
        const nextMockCursor = currentCursorInt + PAGE_SIZE;

        setPosts(prev => isLoadMore ? [...prev, ...paginatedSlice] : paginatedSlice);
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
        
        setPosts(prev => isLoadMore ? [...prev, ...response.contents] : response.contents);
        setNextCursor(response.nextCursor ?? undefined);
        setHasMore(!!response.nextCursor);
      }
    } catch (error) {
      handleError(error, "Không thể tải bài viết");
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
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadPosts(true);
        }
      },
      { threshold: 1.0 }
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

  return (
    <Stack spacing={0} sx={{ pb: 10 }}>
      {/* ==========================================
          1. HERO SECTION
          ========================================== */}
      <Box
        sx={{
          width: "100%",
          minHeight: { xs: 320, md: 400 },
          borderRadius: { xs: 4, md: 6 },
          background: "linear-gradient(145deg, #f8fafc 0%, #e0f2fe 100%)",
          color: "#0f172a",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          mb: { xs: 6, md: 8 },
          boxShadow: "0 20px 40px -15px rgba(2, 132, 199, 0.15)",
          border: "1px solid rgba(56, 189, 248, 0.2)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "-20%",
            right: "-10%",
            width: "50%",
            height: "140%",
            background: "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <Box sx={{ p: { xs: 4, sm: 6, md: 8 }, zIndex: 1, width: "100%" }}>
          <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: 1, 
              bgcolor: "rgba(255, 255, 255, 0.6)", 
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              px: 2.5, 
              py: 1, 
              borderRadius: 10, 
              mb: 4 
            }}>
              <MessageSquare size={16} color="#0284c7" />
              <Typography variant="body2" sx={{ fontWeight: 700, color: "#0369a1", letterSpacing: "0.02em" }}>
                Cộng đồng DevEdu
              </Typography>
            </Box>
            
            <Typography variant="h2" sx={{ 
              fontWeight: 900, 
              mb: 3, 
              fontSize: { xs: "2.25rem", sm: "3rem", md: "3.75rem" }, 
              lineHeight: 1.15, 
              letterSpacing: "-0.03em",
              color: "#0f172a"
            }}>
              Nơi kết nối <br/> 
              <Box component="span" sx={{ color: "#0284c7" }}>Đam mê công nghệ</Box>
            </Typography>
            
            <Typography variant="body1" sx={{ 
              color: "#475569", 
              mb: 5, 
              fontSize: { xs: "1.125rem", md: "1.25rem" }, 
              lineHeight: 1.6,
              maxWidth: 600,
            }}>
              Cùng nhau thảo luận, giải đáp thắc mắc và chia sẻ kinh nghiệm học tập. Mọi câu hỏi đều đáng giá.
            </Typography>
            
            <Stack direction="row" spacing={4}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 3, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                  <Users size={24} color="#0284c7" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: "#0f172a" }}>25k+</Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Thành viên</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ p: 1.5, bgcolor: "#fff", borderRadius: 3, boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                  <TrendingUp size={24} color="#0284c7" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, color: "#0f172a" }}>10k+</Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Bài viết</Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* ==========================================
          2. SEARCH SECTION
          ========================================== */}
      <Box sx={{ mb: { xs: 5, md: 6 }, px: { xs: 0, sm: 2 } }}>
        <Box sx={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm chủ đề, câu hỏi, bài hướng dẫn..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={24} color={isFocused ? "#0284c7" : "#94a3b8"} style={{ transition: "color 0.3s", marginLeft: 8 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Fade in={keyword.length > 0}>
                    <InputAdornment position="end">
                      <Button 
                        variant="contained" 
                        size="small" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setDebouncedKeyword(keyword)}
                        sx={{ 
                          borderRadius: 50, 
                          textTransform: "none", 
                          fontWeight: 700,
                          bgcolor: "#0ea5e9",
                          boxShadow: "none",
                          "&:hover": { bgcolor: "#0284c7", boxShadow: "none" }
                        }}
                      >
                        Tìm
                      </Button>
                    </InputAdornment>
                  </Fade>
                )
              }
            }}
            sx={{
              maxWidth: 700,
              '& .MuiOutlinedInput-root': {
                borderRadius: 50,
                backgroundColor: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: { xs: '1rem', md: '1.125rem' },
                padding: '6px 8px 6px 16px',
                boxShadow: isFocused 
                  ? '0 15px 30px -10px rgba(14, 165, 233, 0.2)' 
                  : '0 8px 20px -8px rgba(15, 23, 42, 0.08)',
                border: '1px solid #e2e8f0',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 12px 25px -8px rgba(15, 23, 42, 0.1)',
                  '& fieldset': { borderColor: 'transparent' },
                },
                '&.Mui-focused': {
                  transform: 'translateY(-2px)',
                  '& fieldset': {
                    borderColor: '#38bdf8',
                    borderWidth: 2,
                  },
                }
              }
            }}
          />
        </Box>
        
        {/* Quick Suggestion Tags */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2.5, flexWrap: "wrap" }}>
          <Typography variant="caption" sx={{ color: "#64748b", display: "flex", alignItems: "center", fontWeight: 600, mr: 1 }}>
            Phổ biến:
          </Typography>
          {["React", "Spring Boot", "Clean Architecture", "AI Tools"].map((tag) => (
            <Chip 
              key={tag} 
              label={tag} 
              onClick={() => { setKeyword(tag); setDebouncedKeyword(tag); }}
              size="small"
              sx={{ 
                bgcolor: "#f1f5f9", 
                color: "#475569", 
                fontWeight: 600,
                fontSize: "0.75rem",
                "&:hover": { bgcolor: "#e0f2fe", color: "#0369a1" },
              }} 
            />
          ))}
        </Box>
      </Box>

      {/* ==========================================
          3. MAIN CONTENT GRID (Feed + Sidebar)
          ========================================== */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: { xs: 4, lg: 6 } }}>
        
        {/* LEFT COLUMN: Posts Feed */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: 1.5 }}>
              <TrendingUp size={24} color="#0284c7" /> Thảo luận mới nhất
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
                "&:hover": { bgcolor: "#1e293b", boxShadow: "0 4px 12px rgba(15,23,42,0.2)" }
              }}
            >
              Tạo bài viết
            </Button>
          </Box>

          {loading ? (
            <Stack spacing={3}>
              {Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} sx={{ borderRadius: 4, boxShadow: "0 2px 10px rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
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
            <Box sx={{ 
              textAlign: "center", 
              py: 10, 
              bgcolor: "#ffffff", 
              borderRadius: 6, 
              border: "1px dashed #cbd5e1"
            }}>
              <MessageSquare size={48} color="#94a3b8" style={{ margin: "0 auto 16px" }} />
              <EmptyState
                title="Không tìm thấy bài viết"
                subtitle="Thử tìm kiếm với từ khóa khác hoặc là người đầu tiên chia sẻ về chủ đề này."
              />
            </Box>
          ) : (
            <Stack spacing={3}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {/* Infinite Scroll Target */}
              {hasMore && (
                <Box ref={observerTarget} sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                  {loadingMore ? (
                    <CircularProgress size={30} sx={{ color: "#0284c7" }} />
                  ) : (
                    <Typography variant="body2" sx={{ color: "transparent" }}>Cột mốc tải</Typography>
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
            <Card sx={{ 
              borderRadius: 4, 
              bgcolor: "#ffffff", 
              boxShadow: "0 4px 20px -5px rgba(0,0,0,0.05)",
              border: "1px solid rgba(0,0,0,0.03)",
              mb: 4
            }}>
              <Box sx={{ p: 2.5, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 1.5 }}>
                <Flame size={20} color="#ef4444" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "#0f172a" }}>
                  Chủ đề nóng
                </Typography>
              </Box>
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                <Stack>
                  {[
                    { title: "Làm thế nào để qua môn thuật toán giải thuật?", users: 45, hours: 2 },
                    { title: "Sự thật về Node.js Event Loop", users: 128, hours: 5 },
                    { title: "Review thực tập sinh tại công ty công nghệ lớn", users: 89, hours: 12 }
                  ].map((topic, i) => (
                    <Box key={i} sx={{ 
                      p: 2.5, 
                      borderBottom: "1px solid #f8fafc",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f8fafc" },
                      transition: "background 0.2s"
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b", mb: 1, lineHeight: 1.4 }}>
                        {topic.title}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "#64748b" }}>
                        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Users size={12} /> {topic.users}
                        </Typography>
                        <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Clock size={12} /> {topic.hours}h trước
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
            
            {/* Guidelines Card */}
            <Card sx={{ 
              borderRadius: 4, 
              bgcolor: "transparent", 
              boxShadow: "none",
              border: "1px dashed #cbd5e1",
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155", mb: 1.5 }}>
                  Văn hóa cộng đồng
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b", lineHeight: 1.6, mb: 2 }}>
                  Môi trường thảo luận lập trình chuyên nghiệp. Tôn trọng đồng nghiệp, chia sẻ kiến thức chất lượng và không đăng nội dung spam.
                </Typography>
                <Button variant="text" size="small" endIcon={<ChevronRight size={16} />} sx={{ color: "#0284c7", fontWeight: 700, p: 0 }}>
                  Đọc nội quy
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>

    </Stack>
  );
}
