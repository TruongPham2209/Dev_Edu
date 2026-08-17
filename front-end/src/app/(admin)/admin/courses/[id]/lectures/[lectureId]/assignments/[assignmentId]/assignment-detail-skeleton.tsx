"use client";

import { Box, Container, Skeleton, Stack } from "@mui/material";

export function AssignmentDetailSkeleton() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      <Stack component="div" spacing={{ xs: 2.5, sm: 4 }}>
        {/* Assignment Hero Section Skeleton */}
        <Stack spacing={3}>
          {/* Breadcrumbs */}
          <Skeleton variant="text" width="30%" height={24} />

          {/* Hero Banner */}
          <Box
            sx={{
              p: { xs: 3, md: 4.5 },
              borderRadius: 3,
              bgcolor: "#f8fafc",
              border: "1px solid rgba(148, 163, 184, 0.12)",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="15%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="70%" height={60} />
            </Box>
            <Box
              sx={{
                minWidth: { xs: "100%", md: 250 },
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: "white",
              }}
            >
              <Skeleton
                variant="rectangular"
                height={50}
                sx={{ mb: 2.5, borderRadius: 1.5 }}
              />
              <Skeleton
                variant="rectangular"
                height={50}
                sx={{ borderRadius: 1.5 }}
              />
            </Box>
          </Box>

          {/* Instructions Box Skeleton */}
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(148, 163, 184, 0.15)",
            }}
          >
            <Skeleton variant="text" width="15%" height={40} sx={{ mb: 3 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
        </Stack>

        {/* Submissions List Skeleton */}
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
      </Stack>
    </Container>
  );
}
