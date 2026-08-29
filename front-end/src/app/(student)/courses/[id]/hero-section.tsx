"use client";

import { useCategoriesQuery } from "@/lib/api/courses";
import type { CourseResponse } from "@/lib/type/courses";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  AvatarGroup,
  Box,
  Breadcrumbs,
  Typography,
  alpha,
} from "@mui/material";
import { ChevronRight, Clock, Home, Star, User } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface HeroSectionProps {
  course: CourseResponse;
  mobilePurchaseCard?: React.ReactNode;
}

export const HeroSection = ({
  course,
  mobilePurchaseCard,
}: HeroSectionProps) => {
  const { data: categories = [] } = useCategoriesQuery();

  const categoryName = useMemo(() => {
    if (!course.categoryId) return null;
    const match = categories.find((c) => c.id === course.categoryId);
    return match ? match.name : null;
  }, [categories, course.categoryId]);

  return (
    <Box
      sx={{
        position: "relative",
        mb: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<ChevronRight size={14} />}
          aria-label="breadcrumb"
          sx={{
            mb: { xs: 2, sm: 3 },
            "& .MuiBreadcrumbs-ol": { alignItems: "center" },
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "text.secondary",
              textDecoration: "none",
              "&:hover": { color: "primary.main" },
            }}
          >
            <Home size={16} />
          </Box>
          <Box
            component={Link}
            href="/courses"
            sx={{
              color: "text.secondary",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              "&:hover": { color: "primary.main" },
            }}
          >
            Courses
          </Box>
        </Breadcrumbs>

        {/* Badges & Categories */}
        <Box
          sx={{
            mb: { xs: 2, sm: 3 },
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          {categoryName && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.18 : 0.1,
                  ),
                color: "primary.main",
                fontWeight: 700,
                fontSize: "0.875rem",
                borderRadius: "full",
                border: "1px solid",
                borderColor: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.3 : 0.2,
                  ),
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                }}
              />
              {/* Category Name */}
              {categoryName}
            </Box>
          )}
          {course.avgReview && course.avgReview > 3 ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "warning.main",
                bgcolor: (theme) =>
                  alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.18 : 0.1,
                  ),
                px: 1.5,
                py: 0.5,
                borderRadius: "full",
                border: "1px solid",
                borderColor: (theme) =>
                  alpha(
                    theme.palette.warning.main,
                    theme.palette.mode === "dark" ? 0.3 : 0.2,
                  ),
              }}
            >
              <Star size={14} fill="currentColor" />
              <Typography sx={{ fontWeight: 700, fontSize: "0.875rem" }}>
                {course.avgReview} Highly Rated
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            mb: { xs: 1.5, sm: 2 },
            fontSize: {
              xs: "1.5rem",
              sm: "2.25rem",
              md: "2.75rem",
              lg: "3.25rem",
            },
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            color: "text.primary",
          }}
        >
          {course.title}
        </Typography>

        {/* MOBILE ONLY: Purchase Card with Video Preview & Price right under Title */}
        {mobilePurchaseCard && (
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              my: { xs: 2.5, sm: 4 },
            }}
          >
            {mobilePurchaseCard}
          </Box>
        )}

        <Typography
          variant="h6"
          sx={{
            color: "text.secondary",
            mb: { xs: 3, sm: 4 },
            fontWeight: 400,
            lineHeight: 1.6,
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.125rem" },
            maxWidth: "95%",
            letterSpacing: "-0.01em",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {course.description?.replace(/<[^>]*>?/gm, "")}
        </Typography>

        {/* Metadata Grid */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1.25, sm: 2, md: 3 },
            mb: { xs: 3, sm: 4 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "background.paper",
              px: 2,
              py: 1,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 4px 15px -10px rgba(0,0,0,0.5)"
                  : "0 4px 15px -10px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                p: 1.25,
                bgcolor: (theme) =>
                  alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === "dark" ? 0.18 : 0.1,
                  ),
                borderRadius: 2,
                color: "primary.main",
              }}
            >
              <User size={18} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.25,
                }}
              >
                Students
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  color: "text.primary",
                }}
              >
                {course.totalEnrollment}
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              bgcolor: "background.paper",
              px: 2,
              py: 1,
              borderRadius: 1.5,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 4px 15px -10px rgba(0,0,0,0.5)"
                  : "0 4px 15px -10px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                p: 1.25,
                bgcolor: (theme) =>
                  alpha(
                    theme.palette.secondary.main,
                    theme.palette.mode === "dark" ? 0.18 : 0.1,
                  ),
                borderRadius: 2,
                color: "secondary.main",
              }}
            >
              <Clock size={18} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  mb: 0.25,
                }}
              >
                Updated
              </Typography>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  color: "text.primary",
                }}
              >
                {formatServerDate(course.createdAt)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Sleek Instructor Card */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: "background.paper",
            px: { xs: 1.5, sm: 2 },
            py: 1,
            borderRadius: 1.5,
            border: "1px solid",
            borderColor: "divider",
            width: { xs: "100%", sm: "fit-content" },
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 10px 30px -10px rgba(0,0,0,0.5)"
                : "0 10px 30px -10px rgba(0,0,0,0.05)",
          }}
        >
          <AvatarGroup
            max={4}
            sx={{
              "& .MuiAvatar-root": {
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                background: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
                fontWeight: 800,
                fontSize: { xs: "0.95rem", sm: "1.125rem" },
                border: "2px solid",
                borderColor: "background.paper",
                color: "white",
              },
            }}
          >
            {course.lecturers && course.lecturers.length > 0 ? (
              course.lecturers.map((lecturer) => (
                <Avatar key={lecturer}>
                  {lecturer.charAt(0).toUpperCase()}
                </Avatar>
              ))
            ) : (
              <Avatar>G</Avatar>
            )}
          </AvatarGroup>
          <Box>
            <Typography
              sx={{
                fontSize: "0.875rem",
                color: "text.secondary",
                mb: 0.25,
                fontWeight: 500,
              }}
            >
              Lecturers
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: { xs: "0.95rem", sm: "1.125rem" },
                color: "text.primary",
                letterSpacing: "-0.01em",
              }}
            >
              {course.lecturers && course.lecturers.length > 0
                ? course.lecturers.join(", ")
                : "Not updated"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
