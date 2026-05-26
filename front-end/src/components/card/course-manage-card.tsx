"use client";

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";

import { formatServerDate } from "@/lib/date-utils";

export type CourseCardProps = {
  title: string;
  description: string;
  thumbnailUrl: string;
  createdAt: string;
  href: string;
  loading?: boolean;
};

const CourseManageCardBase = ({
  title,
  createdAt,
  description,
  thumbnailUrl,
  href,
}: Omit<CourseCardProps, "loading">) => {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 20px 40px -12px rgba(15, 23, 42, 0.12)",
          borderColor: "primary.main",
          "& .course-thumbnail-overlay": {
            opacity: 1,
          },
          "& .course-thumbnail": {
            transform: "scale(1.08)",
          },
        },
      }}
    >
      <CardActionArea
        component={Link}
        href={href}
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          "&:hover .MuiCardActionArea-focusHighlight": {
            opacity: 0,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            height: 150,
            overflow: "hidden",
            bgcolor: "rgba(15, 23, 42, 0.02)",
          }}
        >
          {thumbnailUrl ? (
            <Box
              component="img"
              src={thumbnailUrl}
              alt={title}
              className="course-thumbnail"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
                background:
                  "linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.1) 100%)",
              }}
            >
              <BookOpen size={40} strokeWidth={1.5} />
            </Box>
          )}

          <Box
            className="course-thumbnail-overlay"
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(15, 23, 42, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0,
              transition: "opacity 0.3s ease",
              backdropFilter: "blur(2px)",
            }}
          >
            <Box
              sx={{
                bgcolor: "white",
                borderRadius: "50%",
                p: 1.5,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transform: "scale(0.9)",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1)" },
              }}
            >
              <ChevronRight size={24} color="#0f172a" />
            </Box>
          </Box>
        </Box>

        <CardContent
          sx={{ p: 2, flexGrow: 1, display: "flex", flexDirection: "column" }}
        >
          <Typography
            variant="h6"
            sx={{
              fontSize: "1rem",
              fontWeight: 700,
              lineHeight: 1.4,
              color: "#0f172a",
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.8rem",
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              mb: 2,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "0.85rem",
              lineHeight: 1.5,
              minHeight: "2.55rem",
            }}
          >
            {description?.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ") || ""}
          </Typography>

          <Stack
            direction="row"
            sx={{
              mt: "auto",
              pt: 1.5,
              borderTop: "1px solid",
              borderColor: "rgba(15, 23, 42, 0.04)",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {createdAt && (
              <Typography
                variant="caption"
                sx={{ color: "#94a3b8", fontWeight: 500 }}
              >
                {formatServerDate(createdAt)}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const CourseCardSkeleton = () => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: "12px",
      border: "1px solid",
      borderColor: "rgba(15, 23, 42, 0.08)",
      overflow: "hidden",
    }}
  >
    <Skeleton variant="rectangular" height={150} animation="wave" />
    <CardContent sx={{ p: 2 }}>
      <Skeleton width="90%" height={24} sx={{ mb: 1 }} animation="wave" />
      <Skeleton width="100%" height={16} animation="wave" />
      <Skeleton width="70%" height={16} sx={{ mb: 2 }} animation="wave" />
      <Stack
        direction="row"
        sx={{
          pt: 1.5,
          borderTop: "1px solid",
          borderColor: "rgba(15, 23, 42, 0.04)",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={2}>
          <Skeleton width={30} height={16} animation="wave" />
          <Skeleton width={30} height={16} animation="wave" />
        </Stack>
        <Skeleton width={60} height={16} animation="wave" />
      </Stack>
    </CardContent>
  </Card>
);

export const CourseManageCard = React.memo((props: CourseCardProps) => {
  if (props.loading) {
    return <CourseCardSkeleton />;
  }
  return <CourseManageCardBase {...props} />;
});
