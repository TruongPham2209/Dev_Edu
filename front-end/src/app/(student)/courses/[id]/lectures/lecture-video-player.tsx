"use client";

import { useDownloadUrlQuery } from "@/lib/api/files";
import { useUpdateLectureProgressMutation } from "@/lib/api/lectures";
import { alpha, Box, Button, CircularProgress, Paper, Typography } from "@mui/material";
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
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(isInitiallyCompleted);
  const lastTrackedTime = useRef<number>(0);
  const lastCurrentTime = useRef<number>(0);

  const {
    data: response,
    isLoading: loadingUrl,
    error: queryError,
    refetch: refetchDownloadUrl,
  } = useDownloadUrlQuery(videoObjectKey, {
    enabled: !!videoObjectKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { mutateAsync: updateProgress } = useUpdateLectureProgressMutation();

  const streamUrl = response?.downloadUrl || response?.publicUrl || null;
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const activeVideoUrl = videoUrl || streamUrl;
  const isRefreshingRef = useRef(false);

  // When streamUrl is obtained or updated
  useEffect(() => {
    if (streamUrl) {
      setVideoUrl(streamUrl);
      setError(null);
    } else if (queryError) {
      setError("Cannot fetch video URL. Please try again.");
    }
  }, [streamUrl, queryError]);

  // Handle stream error (e.g. expired presigned URL or network interruption during seek)
  const handleVideoError = async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    // Preserve playback timestamp
    const resumeTime =
      videoRef.current?.currentTime ?? lastCurrentTime.current ?? 0;
    lastCurrentTime.current = resumeTime;

    try {
      const refreshed = await refetchDownloadUrl();
      const freshUrl =
        refreshed.data?.downloadUrl || refreshed.data?.publicUrl;

      if (freshUrl) {
        setVideoUrl(freshUrl);
        setError(null);

        // Restore playback position on next tick
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.currentTime = resumeTime;
            videoRef.current.play().catch(() => {
              // Autoplay may be restricted by browser policy
            });
          }
        }, 150);
      } else {
        setError("Video link expired. Please refresh the page.");
      }
    } catch {
      setError("Failed to refresh video stream.");
    } finally {
      isRefreshingRef.current = false;
    }
  };

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
  }, [lectureId, isCompleted, onCompleted, updateProgress, queryClient]);

  const isLoadingVideo = loadingUrl;

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
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          bgcolor: "grey.100",
          borderRadius: 3,
          border: "1px dashed",
          borderColor: "divider",
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography color="error" variant="body2" sx={{ fontWeight: 600 }}>
          {error}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={() => {
            setError(null);
            refetchDownloadUrl();
          }}
          sx={{ textTransform: "none" }}
        >
          Reload video
        </Button>
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
        src={activeVideoUrl || undefined}
        controls
        preload="metadata"
        playsInline
        onError={handleVideoError}
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
