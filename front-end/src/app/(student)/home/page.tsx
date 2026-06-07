import { HeroSlideshow } from "@/app/(student)/home/hero-slideshow";
import { CourseCard } from "@/components/card/course-card";
import { SkeletonCard } from "@/components/card/skeleton-card";
import { getFeaturedCourses } from "@/lib/api/courses";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  FeaturedArticlesFallback,
  FeaturedArticlesSection,
} from "./featured-articles";

const heroImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
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
        <Suspense fallback={<FeaturedArticlesFallback />}>
          <FeaturedArticlesSection />
        </Suspense>
      </Box>
    </Stack>
  );
}
