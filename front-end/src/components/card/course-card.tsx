"use client";

import type { CourseResponse } from "@/lib/type/courses";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Typography,
} from "@mui/material";
import { Star, Users } from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/util/date-utils";

export function CourseCard({ course }: { course: CourseResponse }) {
  const displayPrice = course.discountedPrice ?? course.originalPrice;
  const hasDiscount =
    course.discountedPrice != null &&
    course.originalPrice != null &&
    course.discountedPrice < course.originalPrice;

  const isFree = course.originalPrice === 0 || displayPrice === 0;

  return (
    <Link
      href={`/courses/${course.id}`}
      style={{
        textDecoration: "none",
        color: "inherit",
        display: "block",
        height: "100%",
      }}
    >
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 4px 20px rgba(0, 0, 0, 0.4)"
              : "0 4px 20px -5px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 16px 32px rgba(0, 0, 0, 0.6)"
                : "0 16px 32px -5px rgba(0, 0, 0, 0.1)",
            "& .MuiCardMedia-root": {
              transform: "scale(1.05)",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: { xs: 150, sm: 160 },
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {course.thumbnailUrl ? (
            <CardMedia
              component="img"
              image={course.thumbnailUrl}
              alt={course.title}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.5s ease",
              }}
            />
          ) : (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                bgcolor: "action.hover",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.5s ease",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No Image
              </Typography>
            </Box>
          )}
        </Box>

        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            p: { xs: 2, sm: 2.5 },
            pb: { xs: "16px !important", sm: "20px !important" },
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.4,
              mb: 1,
              color: "text.primary",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: { xs: "0.9375rem", sm: "1rem" },
              minHeight: { xs: "auto", sm: "2.8em" },
            }}
          >
            {course.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mb: 2.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: { xs: "0.8125rem", sm: "0.875rem" },
              lineHeight: 1.5,
              minHeight: { xs: "auto", sm: "3em" },
            }}
          >
            {course.description?.replace(/<[^>]*>?/gm, "")}
          </Typography>

          {course.lecturers && course.lecturers.length > 0 && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  bgcolor: "action.hover",
                  color: "text.secondary",
                }}
              >
                {course.lecturers[0].charAt(0)}
              </Avatar>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 600, fontSize: "0.8rem" }}
              >
                {course.lecturers.join(", ")}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: "auto" }}>
            <Divider sx={{ my: 2, borderColor: "divider" }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Star size={16} color="#eab308" fill="#eab308" />
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 600 }}
                  >
                    {course.avgReview ? course.avgReview.toFixed(1) : "0.0"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Users size={16} color="currentColor" style={{ opacity: 0.7 }} />
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 600 }}
                  >
                    {Intl.NumberFormat("en-US", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(course.totalEnrollment || 0)}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 1,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                  minWidth: 0,
                }}
              >
                {hasDiscount && !isFree && (
                  <Typography
                    variant="caption"
                    sx={{
                      textDecoration: "line-through",
                      color: "text.disabled",
                      fontWeight: 500,
                      wordBreak: "break-word",
                    }}
                  >
                    {formatPrice(course.originalPrice!)}đ
                  </Typography>
                )}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: isFree ? "success.main" : "error.main",
                    fontSize: "1rem",
                    wordBreak: "break-word",
                  }}
                >
                  {isFree ? "Free" : `${displayPrice ? formatPrice(displayPrice) : "0"}đ`}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
