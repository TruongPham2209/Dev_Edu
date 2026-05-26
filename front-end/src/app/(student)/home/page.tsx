import { HeroSlideshow } from "@/app/(student)/home/hero-slideshow";
import { CourseCard } from "@/components/card/course-card";
import { SkeletonCard } from "@/components/card/skeleton-card";
import { getFeaturedCourses } from "@/lib/api/courses";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

const heroImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
];

// Mock data for featured courses

const featuredArticles = [
  {
    id: "1",
    title: "Tổng hợp các UI Component tốt nhất trong React năm 2026",
    preview:
      "Các thư viện UI Component phổ biến giúp tăng tốc độ phát triển và đảm bảo tính nhất quán cho dự án của bạn...",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80",
    date: "14/05/2026",
  },
  {
    id: "2",
    title: "Tại sao bạn nên chuyển sang dùng TypeScript ngay hôm nay?",
    preview:
      "TypeScript mang lại sự an toàn kiểu dữ liệu và cải thiện DX (Developer Experience) đáng kể so với JavaScript thuần...",
    thumbnail:
      "https://images.unsplash.com/photo-1623479322729-28b25c16b011?w=400&q=80",
    date: "12/05/2026",
  },
  {
    id: "3",
    title: "Hướng dẫn tối ưu hóa hiệu suất ứng dụng Next.js",
    preview:
      "Những kỹ thuật cần biết để giảm thời gian load trang và cải thiện điểm số Core Web Vitals...",
    thumbnail:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80",
    date: "10/05/2026",
  },
];

async function FeaturedCoursesSection() {
  const featuredCourses = await getFeaturedCourses();

  return (
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
        gap: 3,
      }}
    >
      {featuredCourses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </Box>
  );
}

function FeaturedCoursesFallback() {
  return (
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
        gap: 3,
      }}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </Box>
  );
}

export default function HomePage() {
  return (
    <Stack spacing={8} sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: { xs: 4, md: 8 },
          bgcolor: "#f0fdf4",
          borderRadius: 4,
          p: { xs: 4, md: 8 },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h3"
            sx={{ fontWeight: 800, mb: 2, color: "#166534", lineHeight: 1.2 }}
          >
            Ignite your coding journey with expert-led courses and real-world
            projects.
          </Typography>
          <Typography
            variant="h6"
            sx={{ color: "#15803d", mb: 4, fontWeight: 400, lineHeight: 1.6 }}
          >
            Master in-demand tech skills with hands-on projects and expert
            guidance.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Link href="/courses" style={{ textDecoration: "none" }}>
              <Button
                component="div"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#16a34a",
                  "&:hover": { bgcolor: "#15803d" },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  width: "100%",
                }}
              >
                Explore Courses
              </Button>
            </Link>
            <Link href="/forum" style={{ textDecoration: "none" }}>
              <Button
                component="div"
                variant="outlined"
                size="large"
                sx={{
                  color: "#16a34a",
                  borderColor: "#16a34a",
                  "&:hover": { borderColor: "#15803d", bgcolor: "#dcfce7" },
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  width: "100%",
                }}
              >
                Read Articles
              </Button>
            </Link>
          </Stack>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <HeroSlideshow images={heroImages} />
        </Box>
      </Box>

      {/* Featured Courses */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Star size={28} color="#eab308" fill="#eab308" /> Featured Courses
          </Typography>
          <Link href="/courses" style={{ textDecoration: "none" }}>
            <Button
              component="div"
              endIcon={<ArrowRight size={18} />}
              sx={{ color: "#16a34a", fontWeight: 600 }}
            >
              See All Courses
            </Button>
          </Link>
        </Box>
        <Suspense fallback={<FeaturedCoursesFallback />}>
          <FeaturedCoursesSection />
        </Suspense>
      </Box>

      <Divider />

      {/* Featured Articles */}
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <BookOpen size={28} color="#3b82f6" /> Featured Articles
          </Typography>
          <Link href="/forum" style={{ textDecoration: "none" }}>
            <Button
              component="div"
              endIcon={<ArrowRight size={18} />}
              sx={{ color: "#3b82f6", fontWeight: 600 }}
            >
              Read More
            </Button>
          </Link>
        </Box>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 4,
          }}
        >
          {featuredArticles.map((article) => (
            <Link
              key={article.id}
              href="/forum"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "block",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 3,
                  p: 2,
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    transform: "translateY(-2px)",
                  },
                  bgcolor: "#ffffff",
                  height: "100%",
                }}
              >
                <Box
                  component="img"
                  src={article.thumbnail}
                  sx={{
                    width: { xs: "100%", sm: 220 },
                    height: 140,
                    objectFit: "cover",
                    borderRadius: 2,
                  }}
                />
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: "1.1rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {article.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mb: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {article.preview}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.disabled", fontWeight: 500, mt: "auto" }}
                  >
                    {article.date}
                  </Typography>
                </Box>
              </Box>
            </Link>
          ))}
        </Box>
      </Box>
    </Stack>
  );
}
