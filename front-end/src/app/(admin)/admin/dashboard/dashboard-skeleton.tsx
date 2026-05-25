import { Box, Card, CardContent, Grid, Skeleton, Stack } from "@mui/material";

export function DashboardSkeleton() {
  return (
    <>
      <Grid container spacing={2}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card
              sx={{
                border: "1px solid rgba(15, 23, 42, 0.08)",
                background: "rgba(255, 255, 255, 0.9)",
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Skeleton variant="rounded" width={32} height={32} />
                    <Skeleton width="40%" height={20} />
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                    <Skeleton width="30%" height={32} />
                    <Skeleton width="40%" height={24} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} sx={{ mt: 0 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              border: "1px solid rgba(15, 23, 42, 0.08)",
              background: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 4 }}>
                <Box>
                  <Skeleton width={150} height={28} />
                  <Skeleton width={200} height={20} />
                </Box>
                <Skeleton width={180} height={40} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, height: 200 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <Box key={i} sx={{ display: "flex", flexDirection: "column", flex: 1, gap: 1 }}>
                    <Skeleton variant="rounded" height={60 + (i % 3) * 40} sx={{ width: "100%" }} />
                    <Skeleton width="80%" height={16} sx={{ mx: "auto" }} />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              border: "1px solid rgba(15, 23, 42, 0.08)",
              background: "rgba(255, 255, 255, 0.9)",
            }}
          >
            <CardContent>
              <Skeleton width={180} height={28} sx={{ mb: 1 }} />
              <Skeleton width={140} height={20} sx={{ mb: 3 }} />
              <Stack spacing={2}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <Box key={index} sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                    <Skeleton variant="rounded" width={36} height={36} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="60%" height={20} />
                      <Skeleton width="40%" height={16} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
