"use client";

import { Box, Container, Grid, Skeleton, Stack } from "@mui/material";

export function StudentCourseDetailSkeleton() {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        pb: 12,
        backgroundImage: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at top center, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 1) 100%)"
            : "radial-gradient(circle at top center, rgba(255,255,255,1) 0%, rgba(241,245,249,1) 100%)",
        overflowX: "clip",
      }}
    >
      <Container
        maxWidth="lg"
        sx={{ position: "relative", zIndex: 1, pt: { xs: 4, md: 6, lg: 8 } }}
      >
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 7, lg: 8 }}>
            {/* HERO TEXT WRAPPER SKELETON */}
            <Box
              sx={{
                position: "relative",
                mb: { xs: 6, md: 8 },
              }}
            >
              {/* Badges & Categories */}
              <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
                <Skeleton
                  variant="rounded"
                  width={140}
                  height={32}
                  sx={{ borderRadius: "16px" }}
                />
                <Skeleton
                  variant="rounded"
                  width={160}
                  height={32}
                  sx={{ borderRadius: "16px" }}
                />
              </Box>

              {/* Title */}
              <Skeleton variant="text" height={72} width="90%" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={72} width="60%" sx={{ mb: 3 }} />

              {/* Description */}
              <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={28} width="80%" sx={{ mb: 4 }} />

              {/* Metadata Grid */}
              <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
                <Skeleton
                  variant="rounded"
                  width={180}
                  height={72}
                  sx={{ borderRadius: 3 }}
                />
                <Skeleton
                  variant="rounded"
                  width={180}
                  height={72}
                  sx={{ borderRadius: 3 }}
                />
              </Box>

              {/* Sleek Instructor Card */}
              <Skeleton
                variant="rounded"
                width={320}
                height={84}
                sx={{ borderRadius: 4 }}
              />
            </Box>

            {/* MOBILE ONLY: Purchase Card Skeleton */}
            <Box sx={{ display: { xs: "block", md: "none" }, mb: 6 }}>
              <Skeleton
                variant="rounded"
                height={500}
                sx={{ borderRadius: 4 }}
              />
            </Box>

            {/* MAIN CONTENT SKELETON */}
            <Box sx={{ pb: 4 }}>
              <Stack spacing={8}>
                {/* About Section */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Skeleton variant="circular" width={52} height={52} />
                    <Box>
                      <Skeleton variant="text" width={200} height={32} />
                      <Skeleton variant="text" width={300} height={20} />
                    </Box>
                  </Box>
                  <Skeleton
                    variant="rounded"
                    height={150}
                    sx={{ borderRadius: 3 }}
                  />
                </Box>

                {/* Course Content Section */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Skeleton variant="circular" width={52} height={52} />
                    <Box>
                      <Skeleton variant="text" width={200} height={32} />
                      <Skeleton variant="text" width={300} height={20} />
                    </Box>
                  </Box>
                  <Skeleton
                    variant="rounded"
                    height={300}
                    sx={{ borderRadius: 3 }}
                  />
                </Box>

                {/* Review Section */}
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Skeleton variant="circular" width={52} height={52} />
                    <Box>
                      <Skeleton variant="text" width={200} height={32} />
                      <Skeleton variant="text" width={300} height={20} />
                    </Box>
                  </Box>
                  <Skeleton
                    variant="rounded"
                    height={120}
                    sx={{ mb: 3, borderRadius: 3 }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={180}
                    sx={{ mb: 2, borderRadius: 3 }}
                  />
                  <Skeleton
                    variant="rounded"
                    height={180}
                    sx={{ borderRadius: 3 }}
                  />
                </Box>
              </Stack>
            </Box>
          </Grid>

          {/* DESKTOP ONLY: RIGHT STICKY COLUMN */}
          <Grid
            size={{ xs: 12, md: 5, lg: 4 }}
            sx={{
              display: { xs: "none", md: "block" },
              position: "sticky",
              top: 100,
              alignSelf: "flex-start",
              zIndex: 100,
            }}
          >
            <Skeleton variant="rounded" height={600} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
