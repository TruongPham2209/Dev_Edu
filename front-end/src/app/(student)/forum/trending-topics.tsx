"use client";

import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { Clock, Flame, Users } from "lucide-react";

interface TrendingTopic {
  title: string;
  users: number;
  hours: number;
}

interface TrendingTopicsProps {
  topics?: TrendingTopic[];
  onSelectTopic?: (title: string) => void;
}

const DEFAULT_TOPICS: TrendingTopic[] = [
  {
    title: "Làm thế nào để qua môn thuật toán giải thuật?",
    users: 45,
    hours: 2,
  },
  {
    title: "Sự thật về Node.js Event Loop",
    users: 128,
    hours: 5,
  },
  {
    title: "Review thực tập sinh tại công ty công nghệ lớn",
    users: 89,
    hours: 12,
  },
];

export function TrendingTopics({
  topics = DEFAULT_TOPICS,
  onSelectTopic,
}: TrendingTopicsProps) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: (theme) =>
          theme.palette.mode === "dark"
            ? "0 4px 20px -5px rgba(0,0,0,0.5)"
            : "0 4px 20px -5px rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: "divider",
        mb: { xs: 3, sm: 4 },
      }}
    >
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Flame size={20} color="#ef4444" />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          Trending Topics
        </Typography>
      </Box>
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Stack>
          {topics.map((topic, i) => (
            <Box
              key={i}
              onClick={() => onSelectTopic?.(topic.title)}
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderBottom: "1px solid",
                borderColor: "divider",
                cursor: onSelectTopic ? "pointer" : "default",
                "&:hover": onSelectTopic ? { bgcolor: "action.hover" } : {},
                transition: "background 0.2s",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "text.primary",
                  mb: 1,
                  lineHeight: 1.4,
                }}
              >
                {topic.title}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: "text.secondary",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Users size={12} /> {topic.users}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Clock size={12} /> {topic.hours}h ago
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
