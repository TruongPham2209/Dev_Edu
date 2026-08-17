import { HeroSlideshow } from "@/app/(student)/home/hero-slideshow";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { ArrowRight, BookOpen, Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import {
  FeaturedArticlesFallback,
  FeaturedArticlesSection,
} from "./featured-articles";
import {
  FeaturedCoursesFallback,
  FeaturedCoursesSection,
} from "./featured-courses";

const heroImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
];

export default function HomePage() {
  return (
    <Stack spacing={{ xs: 5, sm: 6, md: 8 }} sx={{ pb: { xs: 5, sm: 8 } }}>
      {/* Hero Section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: { xs: 3, sm: 4, md: 8 },
          bgcolor: "#f0fdf4",
          borderRadius: { xs: 3, sm: 4 },
          p: { xs: 2.5, sm: 4, md: 8 },
        }}
      >
        <Box sx={{ flex: 1, width: "100%" }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              mb: { xs: 1.5, sm: 2 },
              color: "#166534",
              lineHeight: { xs: 1.25, md: 1.2 },
              fontSize: { xs: "1.5rem", sm: "2.1rem", md: "2.75rem" },
            }}
          >
            Ignite your coding journey with expert-led courses and real-world
            projects.
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "#15803d",
              mb: { xs: 3, sm: 4 },
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: "0.9375rem", sm: "1.1rem" },
            }}
          >
            Master in-demand tech skills with hands-on projects and expert
            guidance.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{ width: "100%" }}
          >
            <Link
              href="/courses"
              style={{ textDecoration: "none", width: "100%" }}
            >
              <Button
                component="div"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "#16a34a",
                  "&:hover": { bgcolor: "#15803d" },
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  fontWeight: 600,
                  width: "100%",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                }}
              >
                Explore Courses
              </Button>
            </Link>
            <Link
              href="/forum"
              style={{ textDecoration: "none", width: "100%" }}
            >
              <Button
                component="div"
                variant="outlined"
                size="large"
                sx={{
                  color: "#16a34a",
                  borderColor: "#16a34a",
                  "&:hover": { borderColor: "#15803d", bgcolor: "#dcfce7" },
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  fontWeight: 600,
                  width: "100%",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
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
            flexWrap: "wrap",
            gap: 1.5,
            mb: { xs: 2.5, sm: 4 },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            <Star
              size={24}
              color="#eab308"
              fill="#eab308"
              style={{ flexShrink: 0 }}
            />{" "}
            Featured Courses
          </Typography>
          <Link href="/courses" style={{ textDecoration: "none" }}>
            <Button
              component="div"
              endIcon={<ArrowRight size={18} />}
              sx={{
                color: "#16a34a",
                fontWeight: 600,
                fontSize: { xs: "0.85rem", sm: "0.9375rem" },
                p: { xs: "4px 8px", sm: "6px 12px" },
              }}
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
            flexWrap: "wrap",
            gap: 1.5,
            mb: { xs: 2.5, sm: 4 },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
              fontSize: { xs: "1.25rem", sm: "1.5rem" },
            }}
          >
            <BookOpen size={24} color="#3b82f6" style={{ flexShrink: 0 }} />{" "}
            Featured Articles
          </Typography>
          <Link href="/forum" style={{ textDecoration: "none" }}>
            <Button
              component="div"
              endIcon={<ArrowRight size={18} />}
              sx={{
                color: "#3b82f6",
                fontWeight: 600,
                fontSize: { xs: "0.85rem", sm: "0.9375rem" },
                p: { xs: "4px 8px", sm: "6px 12px" },
              }}
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
