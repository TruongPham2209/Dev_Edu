"use client";

import { ErrorState } from "@/components/common/error-state";
import { useActivity } from "@/lib/api/metrics";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Activity,
  CheckSquare,
  Eye,
  LogIn,
  MessageSquare,
  PlusCircle,
  Shield,
  Zap,
} from "lucide-react";
import { useEffect } from "react";

function getActionIcon(action: string) {
  switch (action) {
    case "LOGIN":
      return LogIn;
    case "VIEW_COURSE":
      return Eye;
    case "POST_FORUM":
      return MessageSquare;
    case "SUBMIT_ASSIGNMENT":
      return CheckSquare;
    case "CREATE_COURSE":
      return PlusCircle;
    default:
      return Activity;
  }
}

function getActionColor(action: string) {
  switch (action) {
    case "LOGIN":
      return "#3b82f6"; // Blue
    case "VIEW_COURSE":
      return "#8b5cf6"; // Purple
    case "POST_FORUM":
      return "#f59e0b"; // Orange
    case "SUBMIT_ASSIGNMENT":
      return "#10b981"; // Green
    case "CREATE_COURSE":
      return "#ec4899"; // Pink
    default:
      return "#6366f1"; // Indigo
  }
}

function getActionLabel(action: string) {
  switch (action) {
    case "LOGIN":
      return "Login";
    case "VIEW_COURSE":
      return "View Course";
    case "POST_FORUM":
      return "Post Forum";
    case "SUBMIT_ASSIGNMENT":
      return "Submit Assignment";
    case "CREATE_COURSE":
      return "Create Course";
    default:
      return action;
  }
}

export function ActivityStats() {
  const { handleError } = useApiWithToast();
  const { data, isLoading, error, refetch } = useActivity(30);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load activity stats");
    }
  }, [error, handleError]);

  if (error) {
    return (
      <Card
        sx={{
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <ErrorState
            title="Failed to load activity stats"
            subtitle={error.message}
            onRetry={refetch}
          />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Skeleton width={180} height={28} sx={{ mb: 1 }} />
              <Skeleton width={260} height={20} sx={{ mb: 4 }} />
              <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 6 }}>
                  <Skeleton variant="rounded" height={80} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Skeleton variant="rounded" height={80} />
                </Grid>
              </Grid>
              <Stack spacing={2.5}>
                {Array.from({ length: 3 }).map((_, idx) => (
                  <Box key={idx}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Skeleton width="40%" height={20} />
                      <Skeleton width="15%" height={20} />
                    </Box>
                    <Skeleton variant="rounded" height={8} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Skeleton width={180} height={28} sx={{ mb: 1 }} />
              <Skeleton width={220} height={20} sx={{ mb: 4 }} />
              <Stack spacing={3}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Box
                    key={idx}
                    sx={{ display: "flex", gap: 2, alignItems: "center" }}
                  >
                    <Skeleton variant="circular" width={38} height={38} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton width="70%" height={20} />
                      <Skeleton width="40%" height={16} sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  }

  const {
    dailyActiveUsers = 0,
    totalRequestLogs = 0,
    recentActivities = [],
    actionDistribution = {},
  } = data ?? {};

  const totalActions = Object.values(actionDistribution).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <Grid container spacing={3}>
      {/* LEFT COLUMN: ACTIVITY OVERVIEW & ACTION DISTRIBUTION */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          sx={{
            height: "100%",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0px 4px 20px rgba(0, 0, 0, 0.4)"
                : "0px 4px 20px rgba(0, 0, 0, 0.01)",
            bgcolor: "background.paper",
            backdropFilter: "blur(8px)",
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              System Activity Overview
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              Analyze traffic and user behavior in the last 30 days
            </Typography>

            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: { xs: 1.75, sm: 2 },
                    borderRadius: 2.5,
                    bgcolor: (theme) =>
                      alpha(
                        theme.palette.success.main,
                        theme.palette.mode === "dark" ? 0.18 : 0.08,
                      ),
                    border: "1px solid",
                    borderColor: (theme) =>
                      alpha(theme.palette.success.main, 0.2),
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "success.main",
                      mb: 1,
                    }}
                  >
                    <Zap size={16} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: { xs: "0.675rem", sm: "0.75rem" },
                      }}
                    >
                      Active Users (24h)
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "success.main",
                      fontSize: { xs: "1.5rem", sm: "1.85rem", md: "2rem" },
                    }}
                  >
                    {dailyActiveUsers.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: { xs: 1.75, sm: 2 },
                    borderRadius: 2.5,
                    bgcolor: (theme) =>
                      alpha(
                        theme.palette.primary.main,
                        theme.palette.mode === "dark" ? 0.18 : 0.08,
                      ),
                    border: "1px solid",
                    borderColor: (theme) =>
                      alpha(theme.palette.primary.main, 0.2),
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      color: "primary.main",
                      mb: 1,
                    }}
                  >
                    <Shield size={16} />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: { xs: "0.675rem", sm: "0.75rem" },
                      }}
                    >
                      Total Request Logs
                    </Typography>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "#3b82f6",
                      fontSize: { xs: "1.5rem", sm: "1.85rem", md: "2rem" },
                    }}
                  >
                    {totalRequestLogs.toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              User Behavior Distribution
            </Typography>
            {Object.keys(actionDistribution).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No distribution data available
              </Typography>
            ) : (
              <Stack spacing={2.5}>
                {Object.entries(actionDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([action, count]) => {
                    const percentage =
                      totalActions > 0
                        ? Math.round((count / totalActions) * 100)
                        : 0;
                    const actionColor = getActionColor(action);
                    return (
                      <Box key={action}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.75,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: actionColor,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600 }}
                            >
                              {getActionLabel(action)}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 600 }}
                          >
                            {count.toLocaleString()} ({percentage}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(actionColor, 0.12),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: actionColor,
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* RIGHT COLUMN: RECENT ACTIVITIES FEED */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          sx={{
            height: "100%",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0px 4px 20px rgba(0, 0, 0, 0.4)"
                : "0px 4px 20px rgba(0, 0, 0, 0.01)",
            bgcolor: "background.paper",
            backdropFilter: "blur(8px)",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: "1rem", sm: "1.25rem" } }}
            >
              Recent Activity Log
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
            >
              Latest events and actions on the system
            </Typography>

            {recentActivities.length === 0 ? (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 4,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  No recent activity logs found
                </Typography>
              </Box>
            ) : (
              <Box sx={{ flex: 1, overflowY: "auto", maxH: 380 }}>
                <List disablePadding>
                  {recentActivities.map((activity, index) => {
                    const ActionIcon = getActionIcon(activity.action);
                    const actionColor = getActionColor(activity.action);
                    return (
                      <Box key={index}>
                        <ListItem sx={{ py: 1.5, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 46 }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: alpha(actionColor, 0.12),
                                color: actionColor,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <ActionIcon size={16} strokeWidth={2.2} />
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  alignItems: "baseline",
                                  gap: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    color: "text.primary",
                                  }}
                                >
                                  @{activity.username}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {activity.details}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                {formatServerDate(
                                  activity.createdAt,
                                  "datetime",
                                )}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < recentActivities.length - 1 && (
                          <Divider sx={{ my: 0.5, opacity: 0.6 }} />
                        )}
                      </Box>
                    );
                  })}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
