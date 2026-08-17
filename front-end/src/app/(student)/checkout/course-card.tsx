"use client";

import type { CourseItemResponse } from "@/lib/type/enrollments";
import { Box, Chip, Paper, Typography } from "@mui/material";

interface CourseCardProps {
  course: CourseItemResponse;
}

export function CourseCard({ course }: CourseCardProps) {
  const { title, thumbnailUrl, originalPrice, discountedPrice } = course;

  const discountPercent =
    originalPrice && discountedPrice && originalPrice > discountedPrice
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: { xs: 2, sm: 2.5 },
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: { xs: 1.5, sm: 3 },
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: (theme) => `0 8px 24px ${theme.palette.action.hover}`,
        },
      }}
    >
      <Box
        component="img"
        src={
          thumbnailUrl ||
          "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop"
        }
        alt={title}
        sx={{
          width: { xs: 80, sm: 170, md: 220 },
          height: { xs: 56, sm: 110, md: 135 },
          objectFit: "cover",
          borderRadius: 1.5,
          flexShrink: 0,
        }}
      />
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box>
          <Typography
            variant="h6"
            color="text.primary"
            sx={{
              fontWeight: 800,
              mb: { xs: 0.5, sm: 1.5 },
              lineHeight: 1.3,
              fontSize: { xs: "0.925rem", sm: "1.1rem" },
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            gap: { xs: 1, sm: 1.5 },
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontWeight: 900, fontSize: { xs: "0.95rem", sm: "1.15rem" } }}
          >
            {discountedPrice?.toLocaleString("vi-VN")}đ
          </Typography>
          {originalPrice && originalPrice > (discountedPrice || 0) && (
            <>
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{
                  textDecoration: "line-through",
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.85rem" },
                }}
              >
                {originalPrice.toLocaleString("vi-VN")}đ
              </Typography>
              {discountPercent > 0 && (
                <Chip
                  size="small"
                  label={`-${discountPercent}%`}
                  color="error"
                  sx={{
                    fontWeight: 800,
                    borderRadius: 1.5,
                    height: 22,
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
