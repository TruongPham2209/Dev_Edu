import { Box, Card, Container, Skeleton, Stack } from "@mui/material";

export function AssignmentDetailSkeleton() {
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
      <Box
        sx={{
          borderRadius: 2,
          mb: 4,
          border: "1px solid rgba(148, 163, 184, 0.14)",
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            p: { xs: 3.5, md: 4 },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            sx={{ justifyContent: "space-between" }}
          >
            <Box sx={{ flex: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: "center", mb: 2 }}
              >
                <Skeleton
                  variant="rectangular"
                  width={100}
                  height={26}
                  sx={{ borderRadius: 99 }}
                />
                <Skeleton variant="text" width={120} height={20} />
              </Stack>
              <Skeleton
                variant="text"
                width="50%"
                height={48}
                sx={{ mb: 1.5 }}
              />
            </Box>
            <Box
              sx={{
                minWidth: { xs: "100%", md: 250 },
                p: 2.5,
                borderRadius: 2.5,
                bgcolor: "grey.50",
              }}
            >
              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Skeleton
                    variant="rectangular"
                    width={36}
                    height={36}
                    sx={{ borderRadius: 1.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="text" width="80%" height={24} />
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Skeleton
                    variant="rectangular"
                    width={36}
                    height={36}
                    sx={{ borderRadius: 1.5 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={16} />
                    <Skeleton variant="text" width="80%" height={24} />
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Box>

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
      </Stack>

      {/* Main Content Skeleton */}
      <Card variant="outlined" sx={{ borderRadius: 2, p: 3 }}>
        <Skeleton variant="text" width="40%" height={32} sx={{ mb: 3 }} />
        <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="95%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={20} />
      </Card>
    </Container>
  );
}
