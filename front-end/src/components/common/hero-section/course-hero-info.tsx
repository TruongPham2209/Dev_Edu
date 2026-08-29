"use client";

import type { CourseResponse } from "@/lib/type/courses";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { BookOpen, Calendar, DollarSign } from "lucide-react";
import Image from "next/image";

interface CourseHeroProps {
  course: CourseResponse;
}

export const CourseHeroInfo = ({ course }: CourseHeroProps) => {
  const hasDiscount =
    course.discountedPrice !== null &&
    course.originalPrice !== null &&
    course.discountedPrice < course.originalPrice;

  return (
    <Stack spacing={3} sx={{ width: "100%" }}>
      {/* Main Course Info Card */}
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          backdropFilter: "blur(20px)",
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 10px 40px rgba(0,0,0,0.4)"
              : "0 10px 40px rgba(15,23,42,0.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5, md: 4 } }}>
          <Grid
            container
            spacing={{ xs: 2.5, md: 4 }}
            sx={{ alignItems: "center" }}
          >
            {/* Thumbnail */}
            <Grid size={{ xs: 12, sm: 4, md: 3, lg: 2.5 }}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 1,
                  overflow: "hidden",
                  aspectRatio: "16/12",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 8px 24px -8px rgba(0, 0, 0, 0.6)"
                      : "0 8px 24px -8px rgba(15, 23, 42, 0.2)",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 25vw"
                    priority
                    className="object-cover"
                  />
                ) : (
                  <BookOpen size={48} color="currentColor" style={{ opacity: 0.6 }} />
                )}
              </Box>
            </Grid>

            {/* Course Title and Info */}
            <Grid size={{ xs: 12, sm: 8, md: 9, lg: 9.5 }}>
              <Stack spacing={2}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Chip
                    label="Course"
                    size="small"
                    sx={{
                      height: 32,
                      px: 1,
                      borderRadius: "999px",
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      fontWeight: 800,
                      backdropFilter: "blur(10px)",
                      border: "1px solid",
                      borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 1.75,
                      py: 0.6,
                      borderRadius: "999px",
                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                      border: "1px solid",
                      borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                        boxShadow: (theme) => `0 0 12px ${theme.palette.success.main}`,
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: "success.main",
                      }}
                    >
                      Active
                    </Typography>
                  </Box>
                </Box>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    letterSpacing: "-0.8px",
                    lineHeight: 1.15,
                    color: "text.primary",
                    maxWidth: "100%",
                    fontSize: {
                      xs: "1.35rem",
                      sm: "1.85rem",
                      md: "2.4rem",
                    },
                  }}
                >
                  {course.title}
                </Typography>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1.5, sm: 4 }}
                  divider={
                    <Box
                      sx={{
                        width: { xs: 1, sm: "1px" },
                        height: { xs: "1px", sm: "24px" },
                        bgcolor: "divider",
                        alignSelf: "center",
                      }}
                    />
                  }
                  sx={{ pt: 1 }}
                >
                  {/* Prices */}
                  <Stack
                    component="div"
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <DollarSign size={16} color="currentColor" style={{ opacity: 0.6 }} />
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                      }}
                    >
                      {hasDiscount ? (
                        <Stack
                          component="div"
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "baseline" }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 900,
                              color: "error.main",
                              fontSize: { xs: "1.15rem", sm: "1.4rem" },
                              letterSpacing: "-0.5px",
                            }}
                          >
                            {course.discountedPrice?.toLocaleString()} VND
                          </Typography>
                          <Typography
                            sx={{
                              textDecoration: "line-through",
                              color: "text.secondary",
                              fontWeight: 600,
                              fontSize: { xs: "0.85rem", sm: "1rem" },
                            }}
                          >
                            {course.originalPrice?.toLocaleString()} VND
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography
                          sx={{ fontWeight: 800, color: "text.primary" }}
                        >
                          {course.originalPrice !== null &&
                          course.originalPrice > 0
                            ? `${course.originalPrice.toLocaleString()} VND`
                            : "Miễn phí"}
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  {/* Created At */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center" }}
                  >
                    <Calendar size={16} className="text-slate-500" />
                    <Typography
                      variant="body2"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 550,
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      }}
                    >
                      Created at: {formatServerDate(course.createdAt)}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
};
