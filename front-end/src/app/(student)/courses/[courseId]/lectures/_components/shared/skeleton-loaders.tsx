"use client";

import { Box, Stack, Skeleton, Paper, Grid } from "@mui/material";

export function LectureSkeleton() {
  return (
    <Box sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Stack spacing={4}>
            {/* Header Skeleton */}
            <Box>
              <Skeleton width="150px" height={24} sx={{ mb: 2 }} />
              <Skeleton width="60%" height={48} sx={{ mb: 1 }} />
              <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
              <Skeleton width="40%" height={24} />
            </Box>

            {/* Player Skeleton */}
            <Skeleton
              variant="rectangular"
              width="100%"
              sx={{ aspectRatio: "16/9", borderRadius: 3 }}
            />

            {/* Tabs Skeleton */}
            <Box>
              <Skeleton width="100%" height={64} sx={{ mb: 2 }} />
              <Stack spacing={2}>
                <Skeleton width="100%" height={100} sx={{ borderRadius: 3 }} />
                <Skeleton width="100%" height={100} sx={{ borderRadius: 3 }} />
              </Stack>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <Skeleton width="100%" height={40} sx={{ mb: 2 }} />
            <Stack spacing={1}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  width="100%"
                  height={80}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
