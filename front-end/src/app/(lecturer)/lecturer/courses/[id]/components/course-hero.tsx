import {
  Box,
  Card,
  Stack,
  Typography,
  Chip,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { Calendar, Home, BookOpen, ChevronRight } from "lucide-react";
import Image from "next/image";
import type { CourseDetailProjection } from "@/lib/api/types";
import { parseServerDate } from "@/lib/date-utils";
import Link from "next/link";

export const CourseHero = ({ course }: { course: CourseDetailProjection }) => {
  const formatDate = (dateVal?: unknown) => {
    if (!dateVal) return "N/A";
    try {
      const date = parseServerDate(dateVal);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return "N/A";
    }
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Breadcrumbs
        separator={<ChevronRight size={14} />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-separator": { mx: 1, color: "text.disabled" },
        }}
      >
        <MuiLink
          component={Link}
          underline="hover"
          href="/lecturer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            fontSize: "0.85rem",
            fontWeight: 500,
            color: "text.secondary",
            "&:hover": { color: "primary.main" },
          }}
        >
          <Home size={14} />
          Dashboard
        </MuiLink>
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            fontSize: "0.85rem",
            fontWeight: 600,
            color: "text.primary",
          }}
        >
          {course.title}
        </Typography>
      </Breadcrumbs>

      <Card
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 4,
          p: 4,
          borderRadius: 4,
          boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
          border: "1px solid",
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "100%", md: 320 },
            height: { xs: 200, md: 240 },
            flexShrink: 0,
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          }}
        >
          <Image
            src={
              course.thumbnailUrl ||
              "https://placehold.co/600x400?text=No+Image"
            }
            alt={course.title}
            fill
            style={{ objectFit: "cover" }}
            unoptimized
            priority
          />
        </Box>

        <Stack spacing={2} sx={{ flex: 1, justifyContent: "center" }}>
          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, mb: 1, letterSpacing: "-0.02em" }}
            >
              {course.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: "1.1rem",
                lineHeight: 1.6,
                maxWidth: "800px",
              }}
            >
              {course.description}
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={3}
            sx={{ mt: 2, rowGap: 2, flexWrap: "wrap" }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Calendar size={20} className="text-purple-500" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Created {formatDate(course.createdAt)}
              </Typography>
            </Box>
            <Chip
              label="Active"
              size="small"
              color="success"
              sx={{ fontWeight: 600, borderRadius: 2 }}
            />
          </Stack>
        </Stack>
      </Card>
    </Stack>
  );
};
