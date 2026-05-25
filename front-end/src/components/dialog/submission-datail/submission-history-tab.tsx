"use client";

import {
  Box,
  Card,
  Stack,
  Skeleton,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Activity, Clock } from "lucide-react";
import type { SubmissionLogResponse } from "@/lib/api/types";
import { formatServerDate } from "@/lib/date-utils";
import { useEffect, useRef } from "react";

interface SubmissionHistoryTabProps {
  history: SubmissionLogResponse[];
  historyLoading: boolean;
  historyHasMore: boolean;
  onLoadMoreHistory: () => Promise<void>;
}

export function SubmissionHistoryTab({
  history,
  historyLoading,
  historyHasMore,
  onLoadMoreHistory,
}: SubmissionHistoryTabProps) {
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Auto-trigger load more history logs via Intersection Observer
  useEffect(() => {
    if (!historyHasMore || historyLoading || history.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMoreHistory();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [historyHasMore, historyLoading, history.length, onLoadMoreHistory]);

  return (
    <Box sx={{ maxH: 420, overflowY: "auto", pr: 1, py: 1 }}>
      {historyLoading && history.length === 0 ? (
        <Stack component="div" spacing={3} sx={{ pl: 1 }}>
          {/* Skeleton Activity Row 1 */}
          <Box sx={{ position: "relative", pl: 4, pb: 3 }}>
            <Box
              sx={{
                position: "absolute",
                left: 7,
                top: 22,
                bottom: 0,
                width: 2,
                bgcolor: "divider",
              }}
            />
            <Skeleton
              variant="circular"
              width={16}
              height={16}
              sx={{ position: "absolute", left: 0, top: 4 }}
            />
            <Card
              variant="outlined"
              sx={{
                p: 1.8,
                borderRadius: 1,
                borderColor: "rgba(148,163,184,0.1)",
              }}
            >
              <Skeleton variant="text" width="60%" height={16} sx={{ mb: 1 }} />
              <Stack component="div" direction="row" spacing={1.5}>
                <Skeleton
                  variant="rectangular"
                  width={70}
                  height={18}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton variant="text" width="30%" height={14} />
              </Stack>
            </Card>
          </Box>
          {/* Skeleton Activity Row 2 */}
          <Box sx={{ position: "relative", pl: 4 }}>
            <Skeleton
              variant="circular"
              width={16}
              height={16}
              sx={{ position: "absolute", left: 0, top: 4 }}
            />
            <Card
              variant="outlined"
              sx={{
                p: 1.8,
                borderRadius: 1,
                borderColor: "rgba(148,163,184,0.1)",
              }}
            >
              <Skeleton variant="text" width="50%" height={16} sx={{ mb: 1 }} />
              <Stack component="div" direction="row" spacing={1.5}>
                <Skeleton
                  variant="rectangular"
                  width={60}
                  height={18}
                  sx={{ borderRadius: 1 }}
                />
                <Skeleton variant="text" width="25%" height={14} />
              </Stack>
            </Card>
          </Box>
        </Stack>
      ) : history.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "grey.25",
            borderRadius: 1,
            border: "1px dashed rgba(148, 163, 184, 0.18)",
          }}
        >
          <Activity size={28} style={{ color: "#cbd5e1", marginBottom: 8 }} />
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontWeight: 600 }}
          >
            No activity history recorded
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: "relative", pl: 1 }}>
          {history.map((item, index) => (
            <Box
              key={item.id}
              sx={{
                position: "relative",
                pl: 4,
                pb: index === history.length - 1 ? 0 : 3,
              }}
            >
              {/* Vertical connective line */}
              {index !== history.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 7,
                    top: 22,
                    bottom: 0,
                    width: 2,
                    bgcolor: "divider",
                  }}
                />
              )}
              {/* Bullet icon */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 4,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  bgcolor:
                    item.status === "SUBMITTED" ? "success.50" : "grey.50",
                  border: "2px solid",
                  borderColor:
                    item.status === "SUBMITTED" ? "success.main" : "grey.400",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              />
              {/* Details Content Card */}
              <Box
                sx={{
                  bgcolor: "white",
                  p: 1.5,
                  borderRadius: 1,
                  border: "1px solid rgba(148, 163, 184, 0.12)",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.01)",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  {item.details}
                </Typography>
                <Stack
                  component="div"
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center", mt: 0.8 }}
                >
                  <Chip
                    label={item.status}
                    size="small"
                    color={item.status === "SUBMITTED" ? "success" : "default"}
                    variant="outlined"
                    sx={{
                      height: 18,
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      borderRadius: 1,
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Clock size={11} />
                    {formatServerDate(item.updatedAt, "datetime")}
                  </Typography>
                </Stack>
              </Box>
            </Box>
          ))}

          {/* Automated Scroll Observer Anchor */}
          {historyHasMore && (
            <Box
              ref={observerRef}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1.5,
                mt: 3,
                py: 2,
              }}
            >
              {historyLoading ? (
                <>
                  <CircularProgress size={16} color="success" />
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontWeight: 600 }}
                  >
                    Loading more history...
                  </Typography>
                </>
              ) : (
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  Scroll down to see more activity history
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
