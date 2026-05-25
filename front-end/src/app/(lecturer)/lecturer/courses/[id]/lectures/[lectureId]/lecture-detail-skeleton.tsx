import { Box, Card, Container, Grid, Skeleton, Stack } from "@mui/material";

export function LectureDetailSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs Skeleton */}
      <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 3 }}>
        <Skeleton variant="circular" width={16} height={16} />
        <Skeleton variant="text" width={80} height={20} />
        <Skeleton variant="text" width={120} height={20} />
        <Skeleton variant="text" width={150} height={20} />
      </Stack>

      {/* Hero Banner Skeleton */}
      <Card
        sx={{
          borderRadius: 2,
          mb: 4,
          border: "1px solid rgba(15, 23, 42, 0.08)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.95) 100%)",
          boxShadow: "0 10px 30px -10px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            {/* Video Preview / Thumbnail Skeleton */}
            <Grid size={{ xs: 12, md: 5, lg: 4.5 }}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2.5,
                  overflow: "hidden",
                  aspectRatio: "16/9",
                  boxShadow: "0 12px 24px -10px rgba(15, 23, 42, 0.25)",
                  border: "1px solid rgba(15, 23, 42, 0.08)",
                  bgcolor: "#0f172a",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Skeleton
                  variant="rectangular"
                  sx={{
                    width: "100%",
                    height: "100%",
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                  }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 7, lg: 7.5 }}>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  <Skeleton
                    variant="rectangular"
                    width={70}
                    height={24}
                    sx={{ borderRadius: 1.5 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={24}
                    sx={{ borderRadius: 1.5 }}
                  />
                </Box>
                <Skeleton variant="text" width="80%" height={48} />
                <Box>
                  <Skeleton variant="text" width="100%" height={24} />
                  <Skeleton variant="text" width="60%" height={24} />
                </Box>
                <Skeleton
                  variant="text"
                  width={200}
                  height={24}
                  sx={{ mt: 2 }}
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* Tabs Skeleton */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 4, borderBottom: 1, borderColor: "divider", pb: 1 }}
      >
        <Skeleton
          variant="rectangular"
          width={120}
          height={36}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          width={120}
          height={36}
          sx={{ borderRadius: 1 }}
        />
        <Skeleton
          variant="rectangular"
          width={120}
          height={36}
          sx={{ borderRadius: 1 }}
        />
      </Stack>

      {/* Main Content Skeleton */}
      <Card variant="outlined" sx={{ borderRadius: 2, p: 3 }}>
        <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} />
      </Card>
    </Container>
  );
}
