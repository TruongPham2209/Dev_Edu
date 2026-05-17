"use client";

import {
  Box,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseById } from "@/lib/api/courses";
import type { CourseDetailProjection } from "@/lib/api/types";
import { EmptyState } from "@/components/common/empty-state";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { BookOpen, LayoutDashboard, Users, FileText } from "lucide-react";

import { CourseHero } from "./components/course-hero";
import { LecturesTab } from "./components/lectures-tab";
import { StudentsTab } from "./components/students-tab";

export default function LecturerCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { handleError } = useApiWithToast();

  const [course, setCourse] = useState<CourseDetailProjection | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
      } catch (error) {
        handleError(error, "Failed to load course details");
        router.push("/lecturer/courses"); // Fallback
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [courseId, handleError, router]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Skeleton variant="rounded" height={260} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rounded" height={60} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rounded" height={400} sx={{ borderRadius: 4 }} />
        </Stack>
      </Container>
    );
  }

  if (!course) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <EmptyState
          title="Course not found"
          subtitle="The course you are looking for does not exist or you don't have access to it."
        />
      </Container>
    );
  }

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 4, display: "flex", flexDirection: "column", gap: 4 }}
    >
      <CourseHero course={course} />

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          position: "sticky",
          top: 0,
          bgcolor: "background.default",
          zIndex: 10,
          pt: 1,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              minHeight: 56,
              px: 3,
            },
          }}
        >
          <Tab
            value="overview"
            label="Overview"
            icon={<FileText size={18} />}
            iconPosition="start"
          />
          <Tab
            value="lectures"
            label="Curriculum"
            icon={<BookOpen size={18} />}
            iconPosition="start"
          />
          <Tab
            value="students"
            label="Students"
            icon={<Users size={18} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      <Box sx={{ pb: 8 }}>
        {tab === "overview" && (
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <LayoutDashboard className="text-blue-500" size={24} />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Course Overview
                </Typography>
              </Box>

              <Box
                sx={{
                  typography: "body1",
                  color: "text.secondary",
                  lineHeight: 1.8,
                }}
              >
                {course.description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: course.description }}
                  />
                ) : (
                  <Typography>
                    No detailed description provided for this course.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        )}

        {tab === "lectures" && <LecturesTab courseId={courseId} />}
        {tab === "students" && <StudentsTab courseId={courseId} />}
      </Box>
    </Container>
  );
}
