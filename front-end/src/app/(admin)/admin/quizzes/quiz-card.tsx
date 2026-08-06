"use client";

import { QuizStatusChip } from "@/components/dialog/quiz/quiz-status-chip";
import type { QuizResponse } from "@/lib/type/quizzes";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { BookOpen, CalendarDays, Check, Eye, User, X } from "lucide-react";

interface QuizCardProps {
  quiz: QuizResponse;
  onViewDetails: (quiz: QuizResponse) => void;
  onApprove?: (quiz: QuizResponse) => void;
  onReject?: (quiz: QuizResponse) => void;
  isActionPending?: boolean;
}

export function QuizCard({
  quiz,
  onViewDetails,
  onApprove,
  onReject,
  isActionPending = false,
}: QuizCardProps) {
  const isPending = quiz.status === "PENDING";
  const configCount = quiz.typeConfigs?.length || 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        transition: "all 0.25s ease-in-out",
        borderColor: "rgba(15, 23, 42, 0.08)",
        "&:hover": {
          borderColor: "primary.main",
          transform: "translateY(-3px)",
          boxShadow: "0 12px 28px rgba(37, 99, 235, 0.08)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Header: Title & Status */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1.5,
            mb: 1.5,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "text.primary",
                lineHeight: 1.3,
                mb: 0.5,
              }}
            >
              {quiz.title}
            </Typography>

            {quiz.courseTitle && (
              <Typography
                variant="caption"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  color: "text.secondary",
                  fontWeight: 500,
                }}
              >
                <BookOpen size={13} />
                {quiz.courseTitle}
              </Typography>
            )}
          </Box>

          <QuizStatusChip status={quiz.status} />
        </Box>

        {/* Description snippet */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 40,
            fontSize: "0.85rem",
          }}
        >
          {quiz.description || "This quiz doesn't have a description."}
        </Typography>

        {/* Badges / Metrics Row */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}
        >
          {configCount > 0 && (
            <Chip
              size="small"
              label={`${configCount} Matrix types`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: 1.5, fontSize: "0.75rem" }}
            />
          )}
        </Stack>

        <Divider sx={{ my: 1.5, mt: "auto" }} />

        {/* Metadata Row */}
        <Stack
          direction="row"
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            color: "text.secondary",
            mb: 2.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontWeight: 500,
            }}
          >
            <User size={13} /> {quiz.createdBy || "Instructor"}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              fontWeight: 500,
            }}
          >
            <CalendarDays size={13} />
            {formatServerDate(quiz.createdAt)}
          </Typography>
        </Stack>

        {/* Actions Row */}
        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Eye size={15} />}
            onClick={() => onViewDetails(quiz)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              flex: isPending ? "initial" : 1,
            }}
          >
            View detail
          </Button>

          {/* Pending moderation actions */}
          {isPending && (
            <>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<X size={15} />}
                onClick={() => onReject?.(quiz)}
                disabled={isActionPending}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Reject
              </Button>

              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<Check size={15} />}
                onClick={() => onApprove?.(quiz)}
                disabled={isActionPending}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
              >
                Approve
              </Button>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
