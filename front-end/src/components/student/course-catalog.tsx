"use client";

import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  Fade
} from "@mui/material";
import { useEffect, useState } from "react";
import { getCourses, getCategories } from "@/lib/api/courses";
import type { CourseResponse, CategoryResponse } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { SkeletonCard } from "@/components/common/skeleton-card";
import { CourseCard } from "@/components/course/course-card";
import { 
  Search, 
  BookOpen, 
  Users, 
  Sparkles, 
  TrendingUp, 
  Award,
  ChevronRight,
  Flame,
  LayoutGrid
} from "lucide-react";

export function StudentCourseCatalog() {
  const { handleError } = useApiWithToast();
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  
  // Loading states
  const [initialLoad, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Pagination
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setDebouncedKeyword(searchKeyword);
    }
  };

  // Load categories
  useEffect(() => {
    const loadCats = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        handleError(error, "Không thể tải danh mục");
      }
    };
    loadCats();
  }, [handleError]);

  // Load courses when filters change
  useEffect(() => {
    let isMounted = true;
    
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await getCourses({
          keyword: debouncedKeyword || undefined,
          categoryId: selectedCategory || undefined,
        });
        
        if (isMounted) {
          setCourses(response.contents);
          setNextCursor(response.nextCursor ?? null);
        }
      } catch (error) {
        if (isMounted) handleError(error, "Không thể tải khóa học");
      } finally {
        if (isMounted) {
          setLoading(false);
          setInitialLoad(false);
        }
      }
    };

    fetchCourses();
    
    return () => {
      isMounted = false;
    };
  }, [debouncedKeyword, selectedCategory, handleError]);

  // Load more
  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const response = await getCourses({
        keyword: debouncedKeyword || undefined,
        categoryId: selectedCategory || undefined,
        nextCursor: nextCursor,
      });
      
      setCourses(prev => [...prev, ...response.contents]);
      setNextCursor(response.nextCursor ?? null);
    } catch (error) {
      handleError(error, "Không thể tải thêm khóa học");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Stack spacing={0} sx={{ pb: 10 }}>
      {/* ==========================================
          2. SEARCH SECTION (RICH & INTERACTIVE)
          ========================================== */}
      <Box sx={{ mb: { xs: 6, md: 8 }, px: { xs: 0, sm: 2 } }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
            <Search size={28} color="#38bdf8" /> Bạn muốn học gì hôm nay?
          </Typography>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", position: "relative" }}>
          <TextField
            fullWidth
            placeholder="Tìm theo kỹ năng, ngôn ngữ, hoặc chủ đề (VD: React, Python...)"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={26} color={isFocused ? "#38bdf8" : "#94a3b8"} style={{ transition: "color 0.3s", marginLeft: 8 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <Fade in={searchKeyword.length > 0}>
                    <InputAdornment position="end">
                      <Button 
                        variant="contained" 
                        size="small" 
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setDebouncedKeyword(searchKeyword)}
                        sx={{ 
                          borderRadius: 50, 
                          textTransform: "none", 
                          fontWeight: 700,
                          bgcolor: "#0f172a",
                          "&:hover": { bgcolor: "#1e293b" }
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
              maxWidth: 800,
              '& .MuiOutlinedInput-root': {
                borderRadius: 50,
                backgroundColor: '#ffffff',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: { xs: '1rem', md: '1.15rem' },
                padding: '8px 8px 8px 16px',
                boxShadow: isFocused 
                  ? '0 20px 40px -10px rgba(56, 189, 248, 0.2)' 
                  : '0 10px 30px -10px rgba(15, 23, 42, 0.08)',
                border: '1px solid #e2e8f0',
                '& fieldset': {
                  borderColor: 'transparent',
                },
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 35px -10px rgba(15, 23, 42, 0.12)',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                },
                '&.Mui-focused': {
                  transform: 'translateY(-4px)',
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
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1.5, mt: 3, flexWrap: "wrap" }}>
          <Typography variant="body2" sx={{ color: "#64748b", display: "flex", alignItems: "center", fontWeight: 600 }}>
            Xu hướng:
          </Typography>
          {["ReactJS", "Next.js 14", "Python cho Data Science", "UI/UX Design"].map((tag) => (
            <Chip 
              key={tag} 
              label={tag} 
              onClick={() => {
                setSearchKeyword(tag);
                setDebouncedKeyword(tag);
              }}
              size="small"
              icon={<TrendingUp size={12} />}
              sx={{ 
                bgcolor: "#f1f5f9", 
                color: "#475569", 
                fontWeight: 600,
                border: "1px solid transparent",
                "&:hover": { 
                  bgcolor: "#e0f2fe", 
                  color: "#0369a1",
                  borderColor: "#bae6fd",
                  transform: "translateY(-1px)",
                },
                transition: "all 0.2s"
              }} 
            />
          ))}
        </Box>
      </Box>

      {/* ==========================================
          3. CATEGORIES SECTION (RICH PILLS)
          ========================================== */}
      <Box sx={{ mb: 8, p: 3, bgcolor: "#ffffff", borderRadius: 4, boxShadow: "0 4px 20px -10px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.02)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
          <LayoutGrid size={24} color="#0f172a" />
          <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a" }}>
            Lộ trình & Chủ đề học tập
          </Typography>
        </Box>
        
        <Box 
          sx={{ 
            display: "flex", 
            gap: 1.5, 
            overflowX: "auto", 
            pb: 2, 
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-track": { background: "#f8fafc", borderRadius: 10 },
            "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: 10 },
            "&::-webkit-scrollbar-thumb:hover": { background: "#94a3b8" },
          }}
        >
          <Button
            variant={selectedCategory === null ? "contained" : "outlined"}
            onClick={() => setSelectedCategory(null)}
            disableElevation
            startIcon={<Flame size={18} />}
            sx={{
              borderRadius: 12,
              px: 3,
              py: 1.2,
              whiteSpace: "nowrap",
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              color: selectedCategory === null ? "#fff" : "#475569",
              background: selectedCategory === null ? "linear-gradient(135deg, #0f172a 0%, #334155 100%)" : "transparent",
              borderColor: selectedCategory === null ? "transparent" : "#e2e8f0",
              boxShadow: selectedCategory === null ? "0 8px 15px -5px rgba(15,23,42,0.3)" : "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                background: selectedCategory === null ? "linear-gradient(135deg, #1e293b 0%, #475569 100%)" : "#f8fafc",
                borderColor: selectedCategory === null ? "transparent" : "#cbd5e1",
                transform: "translateY(-2px)",
                boxShadow: selectedCategory === null ? "0 10px 20px -5px rgba(15,23,42,0.4)" : "0 4px 10px -5px rgba(0,0,0,0.05)",
              }
            }}
          >
            Tất cả khóa học
          </Button>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <Button
                key={cat.id}
                variant={isActive ? "contained" : "outlined"}
                onClick={() => setSelectedCategory(cat.id)}
                disableElevation
                sx={{
                  borderRadius: 12,
                  px: 3,
                  py: 1.2,
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  color: isActive ? "#fff" : "#475569",
                  background: isActive ? "linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)" : "transparent",
                  borderColor: isActive ? "transparent" : "#e2e8f0",
                  boxShadow: isActive ? "0 8px 15px -5px rgba(2,132,199,0.3)" : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background: isActive ? "linear-gradient(135deg, #0369a1 0%, #0284c7 100%)" : "#f8fafc",
                    borderColor: isActive ? "transparent" : "#cbd5e1",
                    transform: "translateY(-2px)",
                    boxShadow: isActive ? "0 10px 20px -5px rgba(2,132,199,0.4)" : "0 4px 10px -5px rgba(0,0,0,0.05)",
                  }
                }}
              >
                {cat.name}
              </Button>
            );
          })}
        </Box>
      </Box>

      {/* ==========================================
          4. COURSES GRID (RICH LAYERED DESIGN)
          ========================================== */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: 1.5, letterSpacing: "-0.02em" }}>
            <Award size={32} color="#38bdf8" /> Khóa học tuyển chọn
          </Typography>
          <Typography variant="body1" sx={{ color: "#64748b", mt: 1, ml: 5 }}>
            Những khóa học được đánh giá cao nhất bởi cộng đồng.
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          },
          gap: { xs: 2.5, md: 3.5 },
        }}
      >
        {loading || initialLoad ? (
          Array.from({ length: 10 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : courses.length === 0 ? (
          <Box sx={{ 
            gridColumn: "1 / -1", 
            textAlign: "center", 
            py: 12, 
            bgcolor: "#ffffff", 
            borderRadius: 6, 
            border: "2px dashed #cbd5e1",
            boxShadow: "inset 0 4px 20px rgba(0,0,0,0.02)"
          }}>
            <Box sx={{ 
              width: 80, height: 80, borderRadius: "50%", bgcolor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" 
            }}>
              <Search size={40} color="#94a3b8" />
            </Box>
            <Typography variant="h5" color="#0f172a" sx={{ fontWeight: 800, mb: 1 }}>
              Không tìm thấy khóa học phù hợp
            </Typography>
            <Typography variant="body1" color="#64748b" sx={{ maxWidth: 400, margin: "0 auto" }}>
              Có vẻ như chúng tôi chưa có khóa học nào khớp với tìm kiếm của bạn. Hãy thử thay đổi từ khóa hoặc danh mục.
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => { setSearchKeyword(""); setDebouncedKeyword(""); setSelectedCategory(null); }}
              sx={{ mt: 3, borderRadius: 50, px: 4, fontWeight: 700 }}
            >
              Xóa bộ lọc
            </Button>
          </Box>
        ) : (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </Box>

      {/* ==========================================
          5. LOAD MORE PAGING
          ========================================== */}
      {nextCursor && !loading && !initialLoad && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <Button
            variant="outlined"
            onClick={handleLoadMore}
            disabled={loadingMore}
            endIcon={!loadingMore && <ChevronRight size={20} />}
            sx={{
              minWidth: 240,
              borderRadius: 50,
              py: 1.5,
              fontSize: "1.05rem",
              fontWeight: 800,
              borderWidth: 2,
              borderColor: "#e2e8f0",
              color: "#475569",
              bgcolor: "#ffffff",
              boxShadow: "0 4px 15px -5px rgba(0,0,0,0.05)",
              "&:hover": {
                borderWidth: 2,
                borderColor: "#0ea5e9",
                bgcolor: "#f0f9ff",
                color: "#0284c7",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 20px -5px rgba(2, 132, 199, 0.2)",
              },
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {loadingMore ? <CircularProgress size={24} color="inherit" /> : "Tải thêm khóa học"}
          </Button>
        </Box>
      )}
    </Stack>
  );
}
