"use client";

import { Skeleton, Stack } from "@mui/material";

export function LectureDetailSkeleton() {
  return (
    <Stack spacing={4} sx={{ pb: 6 }}>
      {/* Hero Section Skeleton */}
      <Stack spacing={3} sx={{ width: "100%" }}>
        {/* Breadcrumb */}
        <Skeleton
          variant="text"
          width="30%"
          height={24}
          sx={{ borderRadius: 1 }}
        />
        {/* Main Card */}
        <Skeleton variant="rounded" height={320} sx={{ borderRadius: 4 }} />
        {/* Metric Items Grid (3 items) */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
          <Skeleton
            variant="rounded"
            height={90}
            sx={{ borderRadius: 4, flex: 1 }}
          />
          <Skeleton
            variant="rounded"
            height={90}
            sx={{ borderRadius: 4, flex: 1 }}
          />
          <Skeleton
            variant="rounded"
            height={90}
            sx={{ borderRadius: 4, flex: 1 }}
          />
        </Stack>
      </Stack>

      {/* Lists Section Skeleton (Materials & Assignments) */}
      <Stack direction="column" spacing={4}>
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 4 }} />
      </Stack>
    </Stack>
  );
}
