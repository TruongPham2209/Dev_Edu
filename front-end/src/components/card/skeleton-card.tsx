import { Card, CardContent, Skeleton, Stack } from "@mui/material";

export function SkeletonCard() {
  return (
    <Card>
      <Skeleton variant="rectangular" height={160} />
      <CardContent>
        <Stack spacing={1}>
          <Skeleton width="70%" />
          <Skeleton width="90%" />
          <Skeleton width="50%" />
        </Stack>
      </CardContent>
    </Card>
  );
}
