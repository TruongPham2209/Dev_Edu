import { Box, Container, Skeleton } from "@mui/material";

export function LecturerCourseDetailSkeleton() {
  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2.5, sm: 4 }, px: { xs: 2, sm: 3, md: 4 }, display: "flex", flexDirection: "column", gap: { xs: 2.5, sm: 4 } }}
    >
      {/* Course Hero Skeleton */}
      <Skeleton variant="rounded" height={260} sx={{ borderRadius: 3, height: { xs: 220, sm: 260, md: 320 } }} />

      {/* Tabs Skeleton */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          pt: 1,
          overflowX: "auto",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, minWidth: "max-content" }}>
          <Skeleton
            variant="rounded"
            width={120}
            height={48}
            sx={{ borderRadius: "8px 8px 0 0" }}
          />
          <Skeleton
            variant="rounded"
            width={140}
            height={48}
            sx={{ borderRadius: "8px 8px 0 0" }}
          />
          <Skeleton
            variant="rounded"
            width={120}
            height={48}
            sx={{ borderRadius: "8px 8px 0 0" }}
          />
          <Skeleton
            variant="rounded"
            width={120}
            height={48}
            sx={{ borderRadius: "8px 8px 0 0" }}
          />
        </Box>
      </Box>

      {/* Content Skeleton */}
      <Box sx={{ pb: 8 }}>
        <Skeleton variant="rounded" height={360} sx={{ borderRadius: 1.5 }} />
      </Box>
    </Container>
  );
}
