"use client";

import {
  Box,
  Paper,
  alpha,
  Skeleton,
  Typography,
  IconButton,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, Maximize, Settings } from "lucide-react";
import { getDownloadUrl } from "@/lib/api/files";
import { updateLectureProgress } from "@/lib/api/lectures";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(isInitiallyCompleted);
  const lastTrackedTime = useRef<number>(0);

  // Fetch video URL
  useEffect(() => {
    const fetchUrl = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getDownloadUrl(videoObjectKey);
        if (response.downloadUrl) {
          setVideoUrl(response.downloadUrl);
        } else {
          setError("Không tìm thấy link video");
        }
      } catch (err) {
        console.error("Failed to fetch video URL", err);
        setError("Lỗi khi tải video");
      } finally {
        setLoading(false);
      }
    };

    if (videoObjectKey) {
      fetchUrl();
    }
  }, [videoObjectKey]);

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

        if (currentTime - startTime >= 10) {
          try {
            const response = await updateLectureProgress({
              lectureId,
              segmentStart: startTime,
              segmentEnd: currentTime,
            });

            lastTrackedTime.current = currentTime;

            if (response.completed) {
              setIsCompleted(true);
              onCompleted?.();
              clearInterval(interval);
            }
          } catch (err) {
            console.error("Failed to update progress", err);
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lectureId, isCompleted, onCompleted]);

  if (loading) {
    return (
      <Skeleton
        variant="rectangular"
        width="100%"
        sx={{
          aspectRatio: "16/9",
          borderRadius: 3,
          bgcolor: "action.hover",
        }}
      />
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
            updateLectureProgress({
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
