import { Box, Container, Grid, Skeleton, Stack } from "@mui/material";

export function PostDetailSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Left Side: Main Content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={4}>
            {/* Header Skeleton */}
            <Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Skeleton variant="circular" width={48} height={48} />
                  <Box>
                    <Skeleton width={120} height={24} />
                    <Skeleton width={80} height={20} />
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Skeleton variant="circular" width={40} height={40} />
                </Stack>
              </Box>
              <Skeleton width="90%" height={60} />
              <Skeleton width="60%" height={60} />
              <Skeleton width="40%" height={30} sx={{ mt: 2 }} />
            </Box>

            {/* Content Skeleton */}
            <Box>
              <Skeleton width="100%" height={24} />
              <Skeleton width="100%" height={24} />
              <Skeleton width="100%" height={24} />
              <Skeleton width="80%" height={24} />
              <Skeleton width="100%" height={200} sx={{ my: 3 }} />
              <Skeleton width="100%" height={24} />
              <Skeleton width="90%" height={24} />
            </Box>

            {/* Comments Area Placeholder */}
            <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: "divider" }}>
              <Skeleton width={150} height={32} sx={{ mb: 3 }} />
              <Skeleton width="100%" height={80} sx={{ borderRadius: 2 }} />
            </Box>
          </Stack>
        </Grid>

        {/* Right Side: Related Posts Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{ position: { xs: "static", md: "sticky" }, top: { md: 88 } }}
          >
            <Skeleton width="60%" height={32} sx={{ mb: 3 }} />
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={120}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
