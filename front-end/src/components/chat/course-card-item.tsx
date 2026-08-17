"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Chip,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { Sparkles, BookOpen, ChevronRight, ArrowUpRight } from "lucide-react";
import type { CourseCardResponse } from "@/lib/type/chat";
import { formatPrice } from "@/lib/util/date-utils";

export interface CourseCardItemProps {
  course: CourseCardResponse;
}

export function CourseCardItem({ course }: CourseCardItemProps) {
  const router = useRouter();

  const handleViewDetails = () => {
    router.push(`/courses/${course.courseId}`);
  };

  const formattedPrice =
    course.price === 0 ? "Free" : `${formatPrice(course.price)} ₫`;

  return (
    <Card
      elevation={0}
      onClick={handleViewDetails}
      sx={{
        width: "100%",
        cursor: "pointer",
        borderRadius: 2,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(30,41,59,0.9) 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 4px 16px -2px rgba(15, 23, 42, 0.05)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        overflow: "hidden",
        p: { xs: 1.25, sm: 1.5 },
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: 4,
          background: "linear-gradient(180deg, #2563eb 0%, #7c3aed 100%)",
          borderRadius: "4px 0 0 4px",
          opacity: 0.8,
          transition: "opacity 0.2s ease, width 0.2s ease",
        },
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: "0 12px 28px -6px rgba(37, 99, 235, 0.22)",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.45),
          "&::before": {
            width: 5,
            opacity: 1,
          },
          "& .course-card-thumb": {
            transform: "scale(1.06)",
          },
          "& .course-card-action-btn": {
            background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
            color: "#ffffff",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)",
          },
          "& .course-card-chevron": {
            transform: "translateX(2px) translateY(-1px)",
          },
        },
      }}
    >
      {/* Thumbnail Box */}
      <Box
        sx={{
          width: { xs: 68, sm: 84 },
          height: { xs: 52, sm: 64 },
          borderRadius: 1.5,
          overflow: "hidden",
          flexShrink: 0,
          bgcolor: "#f1f5f9",
          position: "relative",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          ml: 0.5,
        }}
      >
        {course.thumbnailUrl ? (
          <CardMedia
            component="img"
            className="course-card-thumb"
            image={course.thumbnailUrl}
            alt={course.title}
            sx={{
              height: "100%",
              width: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <Box
            className="course-card-thumb"
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              color: "#ffffff",
              transition: "transform 0.4s ease",
            }}
          >
            <BookOpen size={24} style={{ opacity: 0.95 }} />
          </Box>
        )}
      </Box>

      {/* Info Body */}
      <Box sx={{ ml: { xs: 1.25, sm: 1.75 }, flexGrow: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            fontSize: { xs: "0.8rem", sm: "0.85rem" },
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: "text.primary",
            mb: 0.5,
          }}
        >
          {course.title}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "0.775rem", sm: "0.825rem" },
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {formattedPrice}
          </Typography>

          {course.matchReason && (
            <Chip
              icon={<Sparkles size={10} style={{ color: "#7c3aed" }} />}
              label={course.matchReason}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.625rem",
                fontWeight: 600,
                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
                color: "#7c3aed",
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2),
                px: 0.25,
                "& .MuiChip-label": { px: 0.5 },
              }}
            />
          )}
        </Stack>
      </Box>

      {/* View Details Action Button */}
      <Button
        size="small"
        className="course-card-action-btn"
        endIcon={
          <ArrowUpRight
            size={14}
            className="course-card-chevron"
            style={{ transition: "transform 0.25s ease" }}
          />
        }
        onClick={(e) => {
          e.stopPropagation();
          handleViewDetails();
        }}
        aria-label="Details"
        sx={{
          ml: 1,
          flexShrink: 0,
          borderRadius: 1.5,
          textTransform: "none",
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
          fontWeight: 600,
          py: 0.5,
          px: { xs: 0.85, sm: 1.25 },
          color: "primary.main",
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.15),
          transition: "all 0.25s ease",
        }}
      >
        Details
      </Button>
    </Card>
  );
}
