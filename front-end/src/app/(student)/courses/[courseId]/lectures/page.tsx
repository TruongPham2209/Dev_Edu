"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Box, Button, Stack, Typography, alpha, useTheme, Paper, Divider } from "@mui/material";
import { ChevronRight, ChevronLeft, CheckCircle2 } from "lucide-react";

import { getLecturesByCourse, getLectureById, updateLectureProgress } from "@/lib/api/lectures";
import { LectureResponse } from "@/lib/api/types";

import { LectureLayout } from "./_components/layout/lecture-layout";
import { SidebarContainer } from "./_components/layout/sidebar/sidebar-container";
import { LectureHeader } from "./_components/header/lecture-header";
import { LectureVideoPlayer } from "./_components/content/lecture-video-player";
import { LectureHTMLContent } from "./_components/content/lecture-html-content";
import { LectureTabsContainer } from "./_components/tabs/lecture-tabs-container";
import { TabComments } from "./_components/tabs/tab-comments/comment-list";
import { TabMaterials } from "./_components/tabs/tab-materials";
import { TabAssignments } from "./_components/tabs/tab-assignments/assignment-list";
import { LectureSkeleton } from "./_components/shared/skeleton-loaders";

export default function StudentLecturePage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.courseId as string;
  const lectureIdFromUrl = searchParams.get("lectureId");

  const [lectures, setLectures] = useState<LectureResponse[]>([]);
  const [activeLecture, setActiveLecture] = useState<LectureResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);

  // Load all lectures for sidebar
  useEffect(() => {
    const loadLectures = async () => {
      try {
        const data = await getLecturesByCourse(courseId);
        setLectures(data);
        
        // If no lectureId in URL, default to first one
        if (!lectureIdFromUrl && data.length > 0) {
          handleSelectLecture(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load lectures", err);
      }
    };
    loadLectures();
  }, [courseId]);

  // Load active lecture details when ID changes
  useEffect(() => {
    if (lectureIdFromUrl) {
      const loadDetail = async () => {
        setLoading(true);
        try {
          const detail = await getLectureById(lectureIdFromUrl);
          setActiveLecture(detail);
        } catch (err) {
          console.error("Failed to load lecture detail", err);
        } finally {
          setLoading(false);
        }
      };
      loadDetail();
    }
  }, [lectureIdFromUrl]);

  const handleSelectLecture = (id: string) => {
    router.push(`/courses/${courseId}/lectures?lectureId=${id}`);
  };

  const currentIndex = useMemo(() => 
    lectures.findIndex(l => l.id === activeLecture?.id), 
  [lectures, activeLecture]);

  const nextLecture = lectures[currentIndex + 1];
  const prevLecture = lectures[currentIndex - 1];

  const handleNext = async () => {
    if (!activeLecture) return;
    
    setNavigating(true);
    try {
      // If text lecture and not completed, mark as completed first
      if (!activeLecture.videoObjectKey && !activeLecture.isCompleted) {
        await updateLectureProgress({
          lectureId: activeLecture.id,
          segmentStart: 0,
          segmentEnd: 0
        });
      }
      
      if (nextLecture) {
        handleSelectLecture(nextLecture.id);
      }
    } catch (err) {
      console.error("Failed to navigate", err);
    } finally {
      setNavigating(false);
    }
  };

  if (loading && !activeLecture) {
    return <LectureSkeleton />;
  }

  if (!activeLecture) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Không tìm thấy bài giảng</Typography>
      </Box>
    );
  }

  return (
    <LectureLayout
      sidebar={
        <SidebarContainer
          lectures={lectures}
          activeLectureId={activeLecture.id}
          onSelectLecture={handleSelectLecture}
        />
      }
    >
      <LectureHeader 
        lecture={activeLecture} 
        courseId={courseId}
        // courseTitle could be fetched or passed from parent if available
      />

      {/* Main content: Video or Text */}
      <Box sx={{ my: 0.5 }}>
        {activeLecture.videoObjectKey ? (
          <LectureVideoPlayer 
            lectureId={activeLecture.id}
            videoObjectKey={activeLecture.videoObjectKey}
            isInitiallyCompleted={activeLecture.isCompleted || false}
            onCompleted={() => {
              // Refresh active lecture to show completed status
              getLectureById(activeLecture.id).then(setActiveLecture);
            }}
          />
        ) : (
          <Paper elevation={0} sx={{ p: 3, borderRadius: 1.5, border: "1px solid", borderColor: "divider" }}>
            <LectureHTMLContent content={activeLecture.content} />
          </Paper>
        )}
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ mt: 1.5, justifyContent: "space-between" }}>
        <Button
          variant="outlined"
          startIcon={<ChevronLeft size={16} />}
          disabled={!prevLecture}
          onClick={() => handleSelectLecture(prevLecture.id)}
          size="small"
          sx={{ borderRadius: 1, px: 2, textTransform: "none", fontWeight: 600 }}
        >
          Bài trước
        </Button>

        <Button
          variant="contained"
          endIcon={activeLecture.isCompleted ? <CheckCircle2 size={16} /> : <ChevronRight size={16} />}
          onClick={handleNext}
          disabled={navigating}
          size="small"
          sx={{ 
            borderRadius: 1, 
            px: 3,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: activeLecture.isCompleted ? "success.main" : "primary.main",
            "&:hover": {
              bgcolor: activeLecture.isCompleted ? "success.dark" : "primary.dark",
            }
          }}
        >
          {navigating ? "Đang xử lý..." : (nextLecture ? "Bài tiếp theo" : "Hoàn thành khóa học")}
        </Button>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Tabs Section */}
      <LectureTabsContainer
        hasVideo={!!activeLecture.videoObjectKey}
        contentTab={<LectureHTMLContent content={activeLecture.content} />}
        commentsTab={<TabComments lectureId={activeLecture.id} />}
        materialsTab={<TabMaterials lectureId={activeLecture.id} />}
        assignmentsTab={<TabAssignments lectureId={activeLecture.id} />}
      />
    </LectureLayout>
  );
}

