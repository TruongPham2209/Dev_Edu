import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import Link from "next/link";
import type { CourseResponse } from "@/lib/api/types";
import { Users, Star } from "lucide-react";

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
          border: "1px solid rgba(0,0,0,0.04)",
          borderRadius: 2,
          boxShadow: "0 4px 20px -5px rgba(0, 0, 0, 0.05)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 16px 32px -5px rgba(0, 0, 0, 0.1)",
            "& .MuiCardMedia-root": {
              transform: "scale(1.05)",
            },
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 160,
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
                bgcolor: "#f8fafc",
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
            p: 2.5,
            pb: "20px !important",
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              lineHeight: 1.4,
              mb: 1,
              color: "#0f172a",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              height: "2.8em",
            }}
          >
            {course.title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mb: 2.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              height: "3em",
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
                  bgcolor: "#f1f5f9",
                  color: "#475569",
                }}
              >
                {course.lecturers[0].charAt(0)}
              </Avatar>
              <Typography
                variant="caption"
                sx={{ color: "#475569", fontWeight: 600, fontSize: "0.8rem" }}
              >
                {course.lecturers.join(", ")}
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: "auto" }}>
            <Divider sx={{ my: 2, borderColor: "#f1f5f9" }} />
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
                    sx={{ color: "#64748b", fontWeight: 600 }}
                  >
                    {course.avgReview ? course.avgReview.toFixed(1) : "0.0"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Users size={16} color="#94a3b8" />
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", fontWeight: 600 }}
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
                      color: "#94a3b8",
                      fontWeight: 500,
                      wordBreak: "break-word",
                    }}
                  >
                    {course.originalPrice!.toLocaleString()}đ
                  </Typography>
                )}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: isFree ? "#059669" : "#e11d48",
                    fontSize: "1rem",
                    wordBreak: "break-word",
                  }}
                >
                  {isFree ? "Free" : `${displayPrice?.toLocaleString()}đ`}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
