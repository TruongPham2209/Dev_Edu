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
          border: "1px solid rgba(255,255,255,0.7)",
          background: `
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.92) 0%,
              rgba(248, 250, 252, 0.96) 100%
            )
          `,
          backdropFilter: "blur(20px)",
          boxShadow: `
            0 10px 40px rgba(15,23,42,0.06),
            0 2px 8px rgba(15,23,42,0.04)
          `,
          "&::before": {
            content: '""',
            position: "absolute",
            top: -120,
            right: -120,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%)",
          },
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
                  boxShadow: "0 8px 24px -8px rgba(15, 23, 42, 0.2)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  bgcolor: "rgba(37, 99, 235, 0.04)",
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
                  <BookOpen size={48} className="text-blue-500 opacity-60" />
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
                      bgcolor: "rgba(37,99,235,0.1)",
                      color: "#2563eb",
                      fontWeight: 800,
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(37,99,235,0.15)",
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
                      bgcolor: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.15)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "#10b981",
                        boxShadow: "0 0 12px #10b981",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: "#059669",
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
                    color: "#0f172a",
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
                    <DollarSign size={16} className="text-slate-500" />
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
                              color: "#ef4444",
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
