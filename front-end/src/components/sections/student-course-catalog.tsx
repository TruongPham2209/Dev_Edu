"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getCourses } from "@/lib/api/courses";
import { getCategories } from "@/lib/api/courses";
import type { CourseResponse, CategoryResponse } from "@/lib/api/types";
import Link from "next/link";

export function StudentCourseCatalog() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [coursesData, categoriesData] = await Promise.all([
          getCourses({
            keyword: searchKeyword,
            categoryId: selectedCategory || undefined,
          }),
          getCategories(),
        ]);
        setCourses(coursesData.contents);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword, selectedCategory]);

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Khám phá khóa học
        </Typography>

        {/* Filters */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm khóa học..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="small"
          />

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label="Tất cả"
              onClick={() => setSelectedCategory(null)}
              variant={selectedCategory === null ? "filled" : "outlined"}
            />
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.name}
                onClick={() => setSelectedCategory(cat.id)}
                variant={selectedCategory === cat.id ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Stack>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : courses.length === 0 ? (
        <Typography
          sx={{ textAlign: "center", color: "text.secondary", py: 4 }}
        >
          Không tìm thấy khóa học nào
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => {
            const displayPrice =
              course.discountedPrice ?? course.originalPrice;
            const hasDiscount =
              course.discountedPrice != null &&
              course.originalPrice != null &&
              course.discountedPrice < course.originalPrice;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": { boxShadow: 4 },
                  }}
                >
                  {(course.thumbnailUrl || course.thumbnailObjectKey) && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={course.thumbnailUrl || course.thumbnailObjectKey}
                      alt={course.title}
                    />
                  )}
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {course.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", flexGrow: 1 }}
                    >
                      {course.description}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignItems: "baseline",
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "#0f766e" }}
                      >
                        {displayPrice != null
                          ? `${displayPrice.toLocaleString()} VND`
                          : "Free"}
                      </Typography>
                      {hasDiscount && (
                        <Typography
                          variant="body2"
                          sx={{
                            textDecoration: "line-through",
                            color: "text.secondary",
                          }}
                        >
                          {course.originalPrice!.toLocaleString()} VND
                        </Typography>
                      )}
                    </Box>

                    {course.lecturers && course.lecturers.length > 0 && (
                      <Stack spacing={0.5} sx={{ mt: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 600, color: "text.secondary" }}
                        >
                          Giảng viên:
                        </Typography>
                        <Box
                          sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}
                        >
                          {course.lecturers.map((lecturer) => (
                            <Chip
                              key={lecturer}
                              label={lecturer}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Stack>
                    )}

                    <Button
                      component={Link}
                      href={`/courses?id=${course.id}`}
                      variant="contained"
                      sx={{
                        bgcolor: "#0f766e",
                        "&:hover": { bgcolor: "#065f55" },
                        mt: "auto",
                      }}
                    >
                      Xem chi tiết
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}
