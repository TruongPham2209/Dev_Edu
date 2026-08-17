import { Box } from "@mui/material";
import { CourseManageCard } from "@/components/card/course-manage-card";

interface CourseManageGridSkeletonProps {
  count?: number;
}

export function CourseManageGridSkeleton({
  count = 6,
}: CourseManageGridSkeletonProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
          xl: "repeat(5, 1fr)",
        },
        gap: { xs: 2, sm: 2.5 },
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <CourseManageCard
          key={index}
          title=""
          description=""
          createdAt=""
          thumbnailUrl=""
          href=""
          loading
        />
      ))}
    </Box>
  );
}
