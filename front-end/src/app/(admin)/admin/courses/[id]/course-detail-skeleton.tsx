import { Box, Card, CardContent, Grid, Skeleton, Stack } from "@mui/material";

export function AdminCourseDetailSkeleton() {
  return (
    <Stack spacing={4} sx={{ width: "100%" }}>
      {/* Breadcrumb Skeleton */}
      <Box sx={{ py: 0.5 }}>
        <Skeleton variant="text" width="30%" height={24} />
      </Box>

      {/* Hero Card Skeleton */}
      <Card
        sx={{
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={4} sx={{ alignItems: "center" }}>
            <Grid size={{ xs: 12, md: 3, lg: 2.5 }}>
              <Skeleton
                variant="rounded"
                width="100%"
                height="auto"
                sx={{ borderRadius: 1, aspectRatio: "16/12" }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
              <Stack spacing={2}>
                <Skeleton variant="text" width="20%" height={24} />
                <Skeleton variant="text" width="60%" height={40} />
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="rounded" width="40%" height={32} />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Course Description Skeleton */}
      <Card
        sx={{
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
          <Box
            sx={{
              mb: 3,
              pb: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Skeleton variant="text" width={200} height={32} />
          </Box>
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="80%" height={20} />
        </CardContent>
      </Card>

      {/* Metrics Grid Skeletons */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ alignItems: "center" }}
                >
                  <Skeleton
                    variant="rounded"
                    width={48}
                    height={48}
                    sx={{ borderRadius: 1 }}
                  />
                  <Box sx={{ flexGrow: 1 }}>
                    <Skeleton width="40%" height={14} />
                    <Skeleton width="60%" height={28} sx={{ mt: 0.5 }} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* List Rows Skeletons */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={520} sx={{ borderRadius: 1 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={520} sx={{ borderRadius: 1 }} />
        </Grid>
      </Grid>
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={520} sx={{ borderRadius: 1 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Skeleton variant="rounded" height={520} sx={{ borderRadius: 1 }} />
        </Grid>
      </Grid>
    </Stack>
  );
}
