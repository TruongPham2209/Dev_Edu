"use client";

import { ErrorState } from "@/components/common/error-state";
import { useTopCourses, useTopUsers } from "@/lib/api/metrics";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Award, BookOpen, MessageSquare, Star, Users } from "lucide-react";
import { useEffect, useState } from "react";

// 1. TOP COURSES COMPONENT
export function TopCoursesList() {
  const { handleError } = useApiWithToast();
  const { data, isLoading, error, refetch } = useTopCourses(5);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load top courses");
    }
  }, [error, handleError]);

  if (error) {
    return (
      <Card
        sx={{ border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <ErrorState
            title="Failed to load top courses"
            subtitle={error.message}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card
        sx={{ border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton width={180} height={28} sx={{ mb: 1 }} />
          <Skeleton width={220} height={20} sx={{ mb: 3 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Skeleton width={100} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={80} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={60} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={60} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={80} height={20} />
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Skeleton width={200} height={24} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={100} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={50} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={100} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={80} height={20} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  }

  const courses = data ?? [];

  return (
    <Card
      sx={{
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 3,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.01)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <BookOpen size={20} className="text-blue-500" />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Top Courses
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
        >
          Based on number of enrolled students
        </Typography>

        {courses.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              No course data
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: "auto !important" }}>
            <Table sx={{ minWidth: 580 }}>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 700,
                      borderBottom: "2px solid rgba(15, 23, 42, 0.06)",
                      py: 1.5,
                    },
                  }}
                >
                  <TableCell>Course</TableCell>
                  <TableCell>Instructor</TableCell>
                  <TableCell align="right">Students</TableCell>
                  <TableCell align="center">Rating</TableCell>
                  <TableCell align="right">Revenue</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {courses.map((course, idx) => (
                  <TableRow
                    key={course.id}
                    sx={{
                      "&:last-child td": { border: 0 },
                      "& td": {
                        py: 1.8,
                        borderBottom: "1px solid rgba(15, 23, 42, 0.05)",
                      },
                      transition: "background 0.2s",
                      "&:hover": { bgcolor: "rgba(15, 23, 42, 0.01)" },
                    }}
                  >
                    <TableCell>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center" }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            bgcolor: alpha("#3b82f6", 0.1),
                            color: "#3b82f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.85rem",
                          }}
                        >
                          {idx + 1}
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: "text.primary" }}
                          >
                            {course.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Price:{" "}
                            {course.price === 0
                              ? "Free"
                              : `${course.price.toLocaleString("vi-VN")} VND`}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 500 }}
                      >
                        @{course.createdBy}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={`${course.enrollmentCount.toLocaleString()} students`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          bgcolor: alpha("#10b981", 0.08),
                          color: "#10b981",
                          border: "1px solid rgba(16, 185, 129, 0.15)",
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Star size={14} fill="#eab308" color="#eab308" />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {course.averageRating.toFixed(1)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({course.reviewCount})
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 800, color: "text.primary" }}
                      >
                        {course.totalRevenue.toLocaleString("vi-VN")} VND
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}

// 2. TOP USERS COMPONENT (STUDENTS & CONTRIBUTORS)
export function TopUsersList() {
  const { handleError } = useApiWithToast();
  const { data, isLoading, error, refetch } = useTopUsers(5);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load top users");
    }
  }, [error, handleError]);

  if (error) {
    return (
      <Card
        sx={{ border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <ErrorState
            title="Failed to load top users"
            subtitle={error.message}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card
        sx={{ border: "1px solid rgba(15, 23, 42, 0.08)", borderRadius: 3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton width={180} height={28} sx={{ mb: 1 }} />
          <Skeleton width={200} height={20} sx={{ mb: 3 }} />
          <Skeleton variant="rounded" height={40} sx={{ mb: 3 }} />
          <Stack spacing={2}>
            {Array.from({ length: 4 }).map((_, idx) => (
              <Box
                key={idx}
                sx={{ display: "flex", gap: 2, alignItems: "center" }}
              >
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="60%" height={20} />
                  <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  const { topStudents = [], topContributors = [] } = data ?? {};

  return (
    <Card
      sx={{
        height: "100%",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        borderRadius: 3,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.01)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(8px)",
      }}
    >
      <CardContent
        sx={{ p: { xs: 2, sm: 3 }, display: "flex", flexDirection: "column", height: "100%" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Users size={20} className="text-purple-500" />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              fontSize: { xs: "1rem", sm: "1.25rem" },
            }}
          >
            Top Users
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
        >
          Top students & top contributors
        </Typography>

        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
            mb: 2.5,
            minHeight: 38,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 700,
              fontSize: { xs: "0.8rem", sm: "0.85rem" },
              minWidth: "auto",
              py: 1,
              flex: 1,
            },
          }}
        >
          <Tab label="Top Students" />
          <Tab label="Top Contributors" />
        </Tabs>

        {activeTab === 0 ? (
          /* STUDENTS LIST */
          topStudents.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                No student data
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2} sx={{ flex: 1, overflowY: "auto" }}>
              {topStudents.map((student, idx) => (
                <Box
                  key={student.username}
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: { xs: "flex-start", sm: "center" },
                    p: { xs: 1.25, sm: 1.5 },
                    borderRadius: 2,
                    border: "1px solid rgba(15, 23, 42, 0.04)",
                    bgcolor: "rgba(255, 255, 255, 0.5)",
                    gap: 1,
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateX(4px)",
                      bgcolor: "rgba(15, 23, 42, 0.01)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ alignItems: "center", width: "100%" }}
                  >
                    <Box sx={{ position: "relative" }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha("#8b5cf6", 0.12),
                          color: "#8b5cf6",
                          fontWeight: 700,
                        }}
                      >
                        {student.fullName ? student.fullName.charAt(0) : "S"}
                      </Avatar>
                      {idx < 3 && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: -4,
                            right: -4,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            bgcolor:
                              idx === 0
                                ? "#eab308"
                                : idx === 1
                                  ? "#cbd5e1"
                                  : "#b45309",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px solid #fff",
                          }}
                        >
                          <Award size={10} color="#fff" />
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {student.fullName || `@${student.username}`}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {student.email}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      display: "flex",
                      flexDirection: { xs: "row", sm: "column" },
                      justifyContent: { xs: "space-between", sm: "flex-end" },
                      alignItems: { xs: "center", sm: "flex-end" },
                      pt: { xs: 0.75, sm: 0 },
                      borderTop: {
                        xs: "1px dashed rgba(15, 23, 42, 0.08)",
                        sm: "none",
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 800, color: "text.primary" }}
                    >
                      {student.totalSpent.toLocaleString("vi-VN")} VND
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {student.enrollmentCount} courses
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          )
        ) : /* CONTRIBUTORS LIST */
        topContributors.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              No contributor data
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2} sx={{ flex: 1, overflowY: "auto" }}>
            {topContributors.map((contributor, idx) => (
              <Box
                key={contributor.username}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  p: { xs: 1.25, sm: 1.5 },
                  borderRadius: 2,
                  border: "1px solid rgba(15, 23, 42, 0.04)",
                  bgcolor: "rgba(255, 255, 255, 0.5)",
                  gap: 1,
                  transition: "all 0.2s",
                  "&:hover": {
                    transform: "translateX(4px)",
                    bgcolor: "rgba(15, 23, 42, 0.01)",
                  },
                }}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: "center", width: "100%" }}
                >
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha("#f59e0b", 0.12),
                        color: "#f59e0b",
                        fontWeight: 700,
                      }}
                    >
                      {contributor.fullName
                        ? contributor.fullName.charAt(0)
                        : "C"}
                    </Avatar>
                    {idx < 3 && (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: -4,
                          right: -4,
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          bgcolor:
                            idx === 0
                              ? "#eab308"
                              : idx === 1
                                ? "#cbd5e1"
                                : "#b45309",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "2px solid #fff",
                        }}
                      >
                        <Award size={10} color="#fff" />
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {contributor.fullName || `@${contributor.username}`}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "block",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      @{contributor.username}
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "space-between", sm: "flex-end" },
                    gap: 2,
                    pt: { xs: 0.75, sm: 0 },
                    borderTop: {
                      xs: "1px dashed rgba(15, 23, 42, 0.08)",
                      sm: "none",
                    },
                  }}
                >
                  <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: "center" }}
                    >
                      <MessageSquare size={13} color="text.secondary" />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {contributor.commentCount}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Comments
                    </Typography>
                  </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
      </CardContent>
    </Card>
  );
}

// MAIN COMBINED COMPONENT FOR SECTION 4
export function TopRankings() {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <TopCoursesList />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <TopUsersList />
      </Grid>
    </Grid>
  );
}
