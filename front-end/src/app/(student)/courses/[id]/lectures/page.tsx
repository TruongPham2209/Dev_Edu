"use client";

import { Box, Container, Divider, Grid } from "@mui/material";
import {
  BookOpen,
  ChevronLeft,
  ClipboardList,
  FileText,
  MessageSquare,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useLectureByIdQuery,
  useLecturesByCourseQuery,
  useUpdateLectureProgressMutation,
} from "@/lib/api/lectures";
import type { LectureResponse } from "@/lib/type/lectures";

import { AnimatedTabs } from "@/components/common/animated-tabs";
import { ErrorState } from "@/components/common/error-state";
import { TabAssignments } from "./assignment-tab";
import { TabComments } from "./comment-tab";
import { LectureContent } from "./lecture-content";
import { LectureSkeleton } from "./lecture-detail-skeleton";
import { LectureHTMLContent } from "./lecture-html-content";
import { TabMaterials } from "./material-tab";
import { SidebarContainer } from "./sidebar-container";

export function CustomTabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lecture-tabpanel-${index}`}
      aria-labelledby={`lecture-tab-${index}`}
      style={{ display: value === index ? "block" : "none" }}
      {...other}
    >
      <Box sx={{ py: 2, width: "100%", overflow: "hidden" }}>{children}</Box>
    </div>
  );
}

export default function StudentLecturePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const courseId = params.id as string;
  const lectureIdFromUrl = searchParams.get("lectureId");

  const [localLectures, setLocalLectures] = useState<LectureResponse[]>([]);
  const [navigating, setNavigating] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Load all lectures for sidebar
  const {
    data: lectures = [],
    refetch: refetchLectures,
    isLoading: isLoadingLectures,
  } = useLecturesByCourseQuery(courseId);

  const handleSelectLecture = useCallback(
    (id: string) => {
      router.push(`/courses/${courseId}/lectures?lectureId=${id}`);
    },
    [router, courseId],
  );

  useEffect(() => {
    if (lectures.length > 0) {
      setLocalLectures(lectures);

      // If no lectureId in URL, default to first uncompleted one, or last one if all completed
      if (!lectureIdFromUrl) {
        const firstUncompleted = lectures.find((l) => !l.isCompleted);
        if (firstUncompleted) {
          handleSelectLecture(firstUncompleted.id);
        } else {
          handleSelectLecture(lectures[lectures.length - 1].id);
        }
      }
    }
  }, [lectures, lectureIdFromUrl, handleSelectLecture]);

  // Load active lecture details when ID changes
  const {
    data: activeLecture,
    isLoading: loading,
    refetch: refetchActiveLecture,
  } = useLectureByIdQuery(lectureIdFromUrl || "", {
    enabled: !!lectureIdFromUrl,
  });

  const { mutateAsync: updateProgress } = useUpdateLectureProgressMutation();

  const currentIndex = useMemo(
    () => localLectures.findIndex((l) => l.id === activeLecture?.id),
    [localLectures, activeLecture],
  );

  const nextLecture = localLectures[currentIndex + 1];
  const prevLecture = localLectures[currentIndex - 1];

  const handleNext = async () => {
    if (!activeLecture) return;

    setNavigating(true);
    try {
      // If text lecture and not completed, mark as completed first
      if (!activeLecture.videoObjectKey && !activeLecture.isCompleted) {
        const res = await updateProgress({
          lectureId: activeLecture.id,
          segmentStart: 0,
          segmentEnd: 0,
        });
        if (res.completed) {
          activeLecture.isCompleted = true;
          refetchLectures();
        }
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

  const isRedirecting = !lectureIdFromUrl && lectures.length > 0;
  if (isLoadingLectures || (loading && !activeLecture) || isRedirecting) {
    return <LectureSkeleton />;
  }

  if (!activeLecture) {
    return (
      <Box
        sx={{
          p: 4,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ErrorState
          title="Lecture not found"
          subtitle="The lecture you are looking for does not exist or has been removed."
          onRetry={() => router.push("/courses")}
          actionLabel="Back to courses"
          iconAction={<ChevronLeft size={18} />}
        />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4, scrollbarGutter: "stable" }}>
      <Grid container spacing={4}>
        {/* Main Content Area */}
        <Grid size={{ xs: 12, lg: 8.5 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <LectureContent
              lecture={activeLecture}
              courseId={courseId}
              prevLecture={prevLecture}
              nextLecture={nextLecture}
              onSelectLecture={handleSelectLecture}
              onNext={handleNext}
              navigating={navigating}
              onVideoCompleted={() => {
                // Refresh active lecture to show completed status
                refetchActiveLecture();
                refetchLectures();
              }}
            />

            <Divider sx={{ my: 3 }} />

            {/* Tabs Section */}
            {(() => {
              const hasVideo = !!activeLecture.videoObjectKey;
              const tabsCount = hasVideo ? 4 : 3;

              // Ensure tabValue is always valid when tabs change
              if (tabValue >= tabsCount && tabValue !== 0) {
                setTabValue(0);
              }

              const tabItems = [];
              if (hasVideo) {
                tabItems.push({
                  label: "Content",
                  icon: <BookOpen size={18} />,
                  component: (
                    <LectureHTMLContent content={activeLecture.content || ""} />
                  ),
                });
              }
              tabItems.push({
                label: "Comments",
                icon: <MessageSquare size={18} />,
                component: <TabComments lectureId={activeLecture.id} />,
              });
              tabItems.push({
                label: "Materials",
                icon: <FileText size={18} />,
                component: <TabMaterials lectureId={activeLecture.id} />,
              });
              tabItems.push({
                label: "Assignments",
                icon: <ClipboardList size={18} />,
                component: <TabAssignments lectureId={activeLecture.id} />,
              });

              return (
                <Box sx={{ width: "100%" }}>
                  <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                    <AnimatedTabs
                      value={tabValue.toString()}
                      onChange={(val) => setTabValue(Number(val))}
                      tabs={tabItems.map((tab, index) => ({
                        value: index.toString(),
                        label: tab.label,
                        icon: tab.icon,
                        iconPosition: "start",
                      }))}
                      aria-label="lecture tabs"
                    />
                  </Box>

                  {tabItems.map((tab, index) => (
                    <CustomTabPanel key={index} value={tabValue} index={index}>
                      {tab.component}
                    </CustomTabPanel>
                  ))}
                </Box>
              );
            })()}
          </Box>
        </Grid>

        {/* Sidebar Area */}
        <Grid size={{ xs: 12, lg: 3.5 }}>
          <Box
            sx={{
              position: { lg: "sticky" },
              top: { lg: 100 },
              maxHeight: { lg: "calc(100vh - 120px)" },
              overflowY: { lg: "auto" },
              // Custom scrollbar for premium feel
              "&::-webkit-scrollbar": {
                width: "4px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "rgba(0,0,0,0.1)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb:hover": {
                background: "rgba(0,0,0,0.2)",
              },
            }}
          >
            <SidebarContainer
              lectures={lectures}
              activeLectureId={activeLecture.id}
              onSelectLecture={handleSelectLecture}
            />
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}
