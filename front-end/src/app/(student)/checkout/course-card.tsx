"use client";

import type { CourseItemResponse } from "@/lib/type/enrollments";
import { Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { User } from "lucide-react";

interface CourseCardProps {
  course: CourseItemResponse;
}

export function CourseCard({ course }: CourseCardProps) {
  const { title, thumbnailUrl, originalPrice, discountedPrice } = course;
  console.log(course);

  const discountPercent =
    originalPrice && discountedPrice && originalPrice > discountedPrice
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 3,
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
          width: { xs: "100%", sm: 220 },
          height: { xs: 200, sm: 140 },
          objectFit: "cover",
          borderRadius: 1,
          flexShrink: 0,
        }}
      />
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}
          >
            {/* <Chip
              size="small"
              icon={<Tag size={12} />}
              label={category}
              sx={{
                borderRadius: 1.5,
                fontWeight: 600,
                bgcolor: "action.hover",
              }}
            /> */}
          </Stack>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.3 }}
          >
            {title}
          </Typography>
          <Stack
            direction="row"
            spacing={3}
            sx={{ color: "text.secondary", mb: 2, flexWrap: "wrap", rowGap: 1 }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <User size={16} />
              {/* <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {instructor}
              </Typography> */}
            </Box>
            {/* <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <PlayCircle size={16} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {lessons} lessons
              </Typography>
            </Box> */}
          </Stack>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography
            variant="h6"
            color="primary.main"
            sx={{ fontWeight: 900 }}
          >
            {discountedPrice?.toLocaleString("vi-VN")}đ
          </Typography>
          {originalPrice && originalPrice > (discountedPrice || 0) && (
            <>
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ textDecoration: "line-through", fontWeight: 600 }}
              >
                {originalPrice.toLocaleString("vi-VN")}đ
              </Typography>
              <Chip
                size="small"
                label={`-${discountPercent}%`}
                color="error"
                sx={{ fontWeight: 800, borderRadius: 1.5, height: 24 }}
              />
            </>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
