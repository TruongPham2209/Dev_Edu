"use client";

import { Box, Container, Grid, Paper, Skeleton, Stack } from "@mui/material";

export function LectureSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 4 }, scrollbarGutter: "stable" }}>
      <Grid container spacing={{ xs: 3, lg: 4 }}>
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Stack spacing={4}>
            {/* Header Skeleton (Matches LectureContent header) */}
            <Stack spacing={1.5}>
              {/* Breadcrumbs */}
              <Skeleton width="30%" height={20} />

              {/* Title & Status Chip */}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ xs: { alignItems: "center" } }}
              >
                <Skeleton width="60%" height={40} />
                <Skeleton width="80px" height={32} sx={{ borderRadius: 1 }} />
              </Stack>

              {/* Summary */}
              <Box>
                <Skeleton width="100%" height={20} />
                <Skeleton width="90%" height={20} />
                <Skeleton width="80%" height={20} />
              </Box>

              {/* Meta (Duration, Updated) */}
              <Stack direction="row" spacing={3}>
                <Skeleton width="80px" height={20} />
                <Skeleton width="120px" height={20} />
              </Stack>
            </Stack>

            {/* Main Video/Text Content */}
            <Box
              sx={{ width: "100%", position: "relative", paddingTop: "56.25%" }}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  borderRadius: 1.5,
                }}
              />
            </Box>

            {/* Prev/Next Buttons */}
            <Stack
              direction="row"
              sx={{ mt: 1.5, justifyContent: "space-between" }}
            >
              <Skeleton width="100px" height={36} sx={{ borderRadius: 1 }} />
              <Skeleton width="120px" height={36} sx={{ borderRadius: 1 }} />
            </Stack>

            {/* Divider */}
            <Skeleton width="100%" height={1} sx={{ my: 3 }} />

            {/* Tabs */}
            <Box>
              <Skeleton width="100%" height={48} sx={{ mb: 2 }} />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={200}
                sx={{ borderRadius: 1.5 }}
              />
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 3.5 }}>
          {/* Sidebar Skeleton (Matches SidebarContainer) */}
          <Paper
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 1.5 }}>
              <Skeleton width="50%" height={24} />
            </Box>
            <Skeleton width="100%" height={1} />
            <Box sx={{ p: 1 }}>
              <Stack spacing={1}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    width="100%"
                    height={56}
                    sx={{ borderRadius: 1 }}
                  />
                ))}
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
