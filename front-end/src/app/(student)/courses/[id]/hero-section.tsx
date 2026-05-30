"use client";

import { useCategoriesQuery } from "@/lib/api/courses";
import { CourseResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Avatar,
  AvatarGroup,
  Box,
  Breadcrumbs,
  Typography,
} from "@mui/material";
import { ChevronRight, Clock, Home, Star, User } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

interface HeroSectionProps {
  course: CourseResponse;
}

export const HeroSection = ({ course }: HeroSectionProps) => {
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
        mb: { xs: 6, md: 8 },
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<ChevronRight size={14} />}
          aria-label="breadcrumb"
          sx={{ mb: 3, "& .MuiBreadcrumbs-ol": { alignItems: "center" } }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              color: "#64748b",
              textDecoration: "none",
              "&:hover": { color: "#0ea5e9" },
            }}
          >
            <Home size={16} />
          </Box>
          <Box
            component={Link}
            href="/courses"
            sx={{
              color: "#64748b",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: 500,
              "&:hover": { color: "#0ea5e9" },
            }}
          >
            Courses
          </Box>
          <Typography
            sx={{
              color: "#0f172a",
              fontSize: "0.875rem",
              fontWeight: 600,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.title}
          </Typography>
        </Breadcrumbs>

        {/* Badges & Categories */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {categoryName && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                bgcolor: "#e0f2fe",
                color: "#0284c7",
                fontWeight: 700,
                fontSize: "0.875rem",
                borderRadius: "full",
                border: "1px solid #bae6fd",
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
                  bgcolor: "#0ea5e9",
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
                color: "#d97706",
                bgcolor: "#fef3c7",
                px: 1.5,
                py: 0.5,
                borderRadius: "full",
                border: "1px solid #fde68a",
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
            mb: 2,
            fontSize: { xs: "2rem", md: "2.75rem", lg: "3.25rem" },
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
            color: "#0f172a",
          }}
        >
          {course.title}
        </Typography>

        <Typography
          variant="h6"
          sx={{
            color: "#475569",
            mb: 4,
            fontWeight: 400,
            lineHeight: 1.6,
            fontSize: { xs: "1rem", md: "1.125rem" },
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
            gap: { xs: 1.5, md: 3 },
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#ffffff",
              px: 2,
              py: 1,
              borderRadius: 1,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 15px -10px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                p: 1.25,
                bgcolor: "#f0f9ff",
                borderRadius: 2,
                color: "#0284c7",
              }}
            >
              <User size={20} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "#64748b",
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
                  fontSize: "1rem",
                  color: "#0f172a",
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
              bgcolor: "#ffffff",
              px: 2,
              py: 1,
              borderRadius: 1,
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 15px -10px rgba(0,0,0,0.05)",
            }}
          >
            <Box
              sx={{
                p: 1.25,
                bgcolor: "#f5f3ff",
                borderRadius: 2,
                color: "#7c3aed",
              }}
            >
              <Clock size={20} />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: "#64748b",
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
                  fontSize: "1rem",
                  color: "#0f172a",
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
            bgcolor: "#ffffff",
            px: 2,
            py: 1,
            borderRadius: 1,
            border: "1px solid #e2e8f0",
            width: "fit-content",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)",
          }}
        >
          <AvatarGroup
            max={4}
            sx={{
              "& .MuiAvatar-root": {
                width: 48,
                height: 48,
                background: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
                fontWeight: 800,
                fontSize: "1.125rem",
                border: "2px solid #ffffff",
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
                color: "#64748b",
                mb: 0.25,
                fontWeight: 500,
              }}
            >
              Lecturers
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: "1.125rem",
                color: "#0f172a",
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
