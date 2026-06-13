"use client";

import { useDownloadUrlQuery } from "@/lib/api/files";
import { useUpdateLectureProgressMutation } from "@/lib/api/lectures";
import { alpha, Box, CircularProgress, Paper, Typography } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

interface LectureVideoPlayerProps {
  lectureId: string;
  videoObjectKey: string;
  onCompleted?: () => void;
  isInitiallyCompleted?: boolean;
}

export function LectureVideoPlayer({
  lectureId,
  videoObjectKey,
  onCompleted,
  isInitiallyCompleted = false,
}: LectureVideoPlayerProps) {
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(isInitiallyCompleted);
  const lastTrackedTime = useRef<number>(0);
  const lastCurrentTime = useRef<number>(0);

  const { data: response, isLoading: loadingUrl } = useDownloadUrlQuery(
    videoObjectKey,
    {
      enabled: !!videoObjectKey,
    },
  );

  const { mutateAsync: updateProgress } = useUpdateLectureProgressMutation();

  // Fetch video URL and load as blob to avoid 403 on long videos
  useEffect(() => {
    const fetchBlob = async () => {
      if (!response?.downloadUrl) return;
      setLoading(true);
      setError(null);
      try {
        const videoRes = await fetch(response.downloadUrl);
        if (!videoRes.ok) throw new Error("Failed to download video content");
        const blob = await videoRes.blob();
        const objectUrl = URL.createObjectURL(blob);
        setVideoUrl(objectUrl);
      } catch (err) {
        console.error("Failed to fetch video URL", err);
        setError("Cannot fetch video url");
      } finally {
        setLoading(false);
      }
    };

    fetchBlob();
  }, [response]);

  // Cleanup blob URL on unmount or URL change
  useEffect(() => {
    return () => {
      if (videoUrl && videoUrl.startsWith("blob:")) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  // Handle Visibility Change (Pause when tab is inactive)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current) {
        videoRef.current.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Track Progress
  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        const startTime = lastTrackedTime.current;
        const previousTime = lastCurrentTime.current;

        // If time jumped by more than 2 seconds, it was a seek
        if (Math.abs(currentTime - previousTime) > 2) {
          // A seek occurred! Send the old segment if duration >= 2s
          if (previousTime - startTime >= 2) {
            try {
              const res = await updateProgress({
                lectureId,
                segmentStart: startTime,
                segmentEnd: previousTime,
              });

              if (res.completed) {
                queryClient.invalidateQueries({ queryKey: ["lectures"] });
                setIsCompleted(true);
                onCompleted?.();
                clearInterval(interval);
              }
            } catch (err) {
              console.error("Failed to update progress on seek", err);
            }
          }
          // After sending (or skipping because it was <2s), update startTime to new time
          lastTrackedTime.current = currentTime;
        } else {
          // Normal playback
          if (currentTime - startTime >= 10) {
            try {
              const res = await updateProgress({
                lectureId,
                segmentStart: startTime,
                segmentEnd: currentTime,
              });

              lastTrackedTime.current = currentTime;

              if (res.completed) {
                setIsCompleted(true);
                onCompleted?.();
                clearInterval(interval);
              }
            } catch (err) {
              console.error("Failed to update progress", err);
            }
          }
        }

        lastCurrentTime.current = currentTime;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lectureId, isCompleted, onCompleted, updateProgress]);

  const isLoadingVideo = loadingUrl || loading;

  if (isLoadingVideo) {
    return (
      <Box sx={{ width: "100%", position: "relative", paddingTop: "56.25%" }}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: 3,
            bgcolor: "black",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            boxShadow: (theme) =>
              `0 20px 40px ${alpha(theme.palette.common.black, 0.2)}`,
          }}
        >
          <CircularProgress color="primary" />
          <Typography
            variant="body2"
            sx={{ color: "grey.400", fontWeight: 500 }}
          >
            Loading video...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          aspectRatio: "16/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "grey.100",
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        aspectRatio: "16/9",
        borderRadius: 3,
        overflow: "hidden",
        bgcolor: "black",
        boxShadow: (theme) =>
          `0 20px 40px ${alpha(theme.palette.common.black, 0.2)}`,
      }}
    >
      <video
        ref={videoRef}
        src={videoUrl || ""}
        controls
        style={{ width: "100%", height: "100%", display: "block" }}
        onEnded={() => {
          // Final progress update if not completed
          if (!isCompleted && videoRef.current) {
            updateProgress({
              lectureId,
              segmentStart: lastTrackedTime.current,
              segmentEnd: Math.floor(videoRef.current.currentTime),
            }).then((res) => {
              if (res.completed) {
                setIsCompleted(true);
                onCompleted?.();
              }
            });
          }
        }}
      />
    </Box>
  );
}
