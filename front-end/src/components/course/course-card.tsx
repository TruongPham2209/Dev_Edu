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
import { Users } from "lucide-react";

export function CourseCard({ course }: { course: CourseResponse }) {
  const displayPrice = course.discountedPrice ?? course.originalPrice;
  const hasDiscount =
    course.discountedPrice != null &&
    course.originalPrice != null &&
    course.discountedPrice < course.originalPrice;

  const isFree = course.originalPrice === 0 || displayPrice === 0;

  return (
    <Link href={`/courses?id=${course.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(0, 0, 0, 0.1)",
          },
        }}
      >
        <Box sx={{ position: "relative", paddingTop: "56.25%" }}>
        {course.thumbnailUrl || course.thumbnailObjectKey ? (
          <CardMedia
            component="img"
            image={course.thumbnailUrl || course.thumbnailObjectKey}
            alt={course.title}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
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
              bgcolor: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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
          p: 2,
          pb: "16px !important",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            lineHeight: 1.4,
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {course.title}
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
            textOverflow: "ellipsis",
            fontSize: "0.875rem",
          }}
        >
          {course.description}
        </Typography>

        {course.lecturers && course.lecturers.length > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                fontSize: "0.75rem",
                bgcolor: "#e2e8f0",
                color: "#64748b",
              }}
            >
              {course.lecturers[0].charAt(0)}
            </Avatar>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {course.lecturers.join(", ")}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: "auto" }}>
          <Divider sx={{ my: 1.5 }} />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Users size={16} color="#64748b" />
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontWeight: 500 }}
              >
                1.2k
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              {hasDiscount && !isFree && (
                <Typography
                  variant="caption"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.disabled",
                  }}
                >
                  {course.originalPrice!.toLocaleString()}đ
                </Typography>
              )}
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: isFree ? "#16a34a" : "#ef4444",
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
