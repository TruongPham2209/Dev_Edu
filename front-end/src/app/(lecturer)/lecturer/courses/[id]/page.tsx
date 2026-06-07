"use client";

import { AnimatedTabs } from "@/components/common/animated-tabs";
import { ErrorState } from "@/components/common/error-state";
import { getCourseById } from "@/lib/api/courses";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Card, CardContent, Container, Typography } from "@mui/material";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LecturerCourseDetailSkeleton } from "./course-detail-skeleton";

import { CourseResponse } from "@/lib/type/courses";
import { CourseHero } from "./course-hero";
import { LecturesTab } from "./lectures-tab";
import { StudentsTab } from "./students-tab";

export default function LecturerCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const { handleError } = useApiWithToast();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [visitedTabs, setVisitedTabs] = useState<string[]>(["overview"]);

  const handleTabChange = (newValue: string) => {
    setTab(newValue);
    if (!visitedTabs.includes(newValue)) {
      setVisitedTabs((prev) => [...prev, newValue]);
    }
  };

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
    return <LecturerCourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: "center" }}>
        <ErrorState
          title="Failed to load course details"
          subtitle="The course you are looking for does not exist or you don't have access to it."
          onRetry={() => router.push("/lecturer")}
          actionLabel="Back to Dashboard"
          iconAction={<ArrowLeft size={18} />}
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
        <AnimatedTabs
          value={tab}
          onChange={handleTabChange}
          colorTheme="primary"
          tabs={[
            {
              value: "overview",
              label: "Overview",
              icon: <FileText size={18} />,
            },
            {
              value: "lectures",
              label: "Curriculum",
              icon: <BookOpen size={18} />,
            },
            {
              value: "students",
              label: "Students",
              icon: <Users size={18} />,
            },
          ]}
        />
      </Box>

      <Box sx={{ pb: 8 }}>
        <Box sx={{ display: tab === "overview" ? "block" : "none" }}>
          <Card
            sx={{
              borderRadius: 1,
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
        </Box>

        {visitedTabs.includes("lectures") && (
          <Box sx={{ display: tab === "lectures" ? "block" : "none" }}>
            <LecturesTab courseId={courseId} />
          </Box>
        )}

        {visitedTabs.includes("students") && (
          <Box sx={{ display: tab === "students" ? "block" : "none" }}>
            <StudentsTab courseId={courseId} />
          </Box>
        )}
      </Box>
    </Container>
  );
}
