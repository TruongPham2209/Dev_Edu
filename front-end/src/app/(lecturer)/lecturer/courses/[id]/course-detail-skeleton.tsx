import { Box, Container, Skeleton } from "@mui/material";

export function LecturerCourseDetailSkeleton() {
  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, display: "flex", flexDirection: "column", gap: 4 }}
    >
      {/* Course Hero Skeleton */}
      <Skeleton variant="rounded" height={320} sx={{ borderRadius: 3 }} />

      {/* Tabs Skeleton */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          pt: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 2 }}>
          <Skeleton
            variant="rounded"
            width={120}
            height={56}
            sx={{ borderRadius: "8px 8px 0 0" }}
          />
          <Skeleton
            variant="rounded"
            width={140}
            height={56}
            sx={{ borderRadius: "8px 8px 0 0" }}
          />
          <Skeleton
            variant="rounded"
            width={120}
            height={56}
            sx={{ borderRadius: "8px 8px 0 0" }}
          />
        </Box>
      </Box>

      {/* Content Skeleton */}
      <Box sx={{ pb: 8 }}>
        <Skeleton variant="rounded" height={400} sx={{ borderRadius: 1 }} />
      </Box>
    </Container>
  );
}
