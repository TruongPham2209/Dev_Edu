"use client";

import { EmptyState } from "@/components/common/empty-state";
import { NotificationDetailDialog } from "@/components/dialog/notification/notification-detail";
import {
  useDeletePersonalNotificationMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsInfiniteQuery,
  useUnreadNotificationCountQuery,
} from "@/lib/api/notification";
import type { NotificationResponse } from "@/lib/type/notification";
import { useAuth } from "@/lib/use-auth";
import { formatServerDate } from "@/lib/util/date-utils";
import { buildNotificationLink } from "@/lib/util/notification-link-utils";
import { stripHtmlTags } from "@/lib/util/text-utils";
import {
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Popover,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Award,
  Bell,
  BellOff,
  CheckCheck,
  FileText,
  FolderPlus,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  MessageSquareReply,
  MoreVertical,
  PlayCircle,
  Reply,
  Trash2,
  User,
  Users,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function getNotificationIconAndStyle(notification: NotificationResponse) {
  if (notification.category === "GROUP") {
    return {
      icon: <Users size={18} />,
      bgcolor: "rgba(245, 158, 11, 0.12)",
      color: "#d97706",
    };
  }

  switch (notification.type) {
    case "COURSE_NEW_LECTURE":
      return {
        icon: <Video size={18} />,
        bgcolor: "rgba(147, 51, 234, 0.12)",
        color: "#9333ea",
      };
    case "COURSE_NEW_ASSIGNMENT":
      return {
        icon: <FileText size={18} />,
        bgcolor: "rgba(37, 99, 235, 0.12)",
        color: "#2563eb",
      };
    case "COURSE_NEW_MATERIAL":
      return {
        icon: <FolderPlus size={18} />,
        bgcolor: "rgba(13, 148, 136, 0.12)",
        color: "#0d9488",
      };
    case "SUBMISSION_FEEDBACK":
      return {
        icon: <GraduationCap size={18} />,
        bgcolor: "rgba(16, 185, 129, 0.12)",
        color: "#10b981",
      };
    case "LECTURE_COMMENT_RESPONSE":
      return {
        icon: <MessageSquareReply size={18} />,
        bgcolor: "rgba(99, 102, 241, 0.12)",
        color: "#6366f1",
      };
    case "QUIZ_ACTIVE":
      return {
        icon: <HelpCircle size={18} />,
        bgcolor: "rgba(245, 158, 11, 0.12)",
        color: "#d97706",
      };
    case "QUIZ_ASSIGNMENT_GRADED":
      return {
        icon: <Award size={18} />,
        bgcolor: "rgba(225, 29, 72, 0.12)",
        color: "#e11d48",
      };
    case "POST_COMMENT":
      return {
        icon: <MessageSquare size={18} />,
        bgcolor: "rgba(14, 165, 233, 0.12)",
        color: "#0ea5e9",
      };
    case "POST_RESPONSE":
      return {
        icon: <Reply size={18} />,
        bgcolor: "rgba(139, 92, 246, 0.12)",
        color: "#8b5cf6",
      };
    default:
      return {
        icon: <User size={18} />,
        bgcolor: "rgba(37, 99, 235, 0.12)",
        color: "#2563eb",
      };
  }
}

export function NotificationCenter() {
  const router = useRouter();
  const { roles } = useAuth();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  // Selected notification for detail modal
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // State for Personal notification action menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [targetNotificationId, setTargetNotificationId] = useState<
    string | null
  >(null);

  // React Query Hooks
  const { data: unreadCountData } = useUnreadNotificationCountQuery({
    refetchInterval: 30000,
  });

  const {
    data: notificationsData,
    isLoading: isNotificationsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useNotificationsInfiniteQuery();

  const { mutate: markAsRead, isPending: isMarkingRead } =
    useMarkNotificationAsReadMutation();

  const { mutate: deletePersonal, isPending: isDeletingPersonal } =
    useDeletePersonalNotificationMutation();

  // Flatten infinite query pages using `contents` field from CustomPaging<T>
  const allNotifications = useMemo(() => {
    if (!notificationsData?.pages) return [];
    return notificationsData.pages.flatMap((page) => page.contents || []);
  }, [notificationsData]);

  // Count unread items directly from loaded notifications
  const unreadFromList = useMemo(() => {
    return allNotifications.filter(
      (n) => n.isRead === false || n.isRead === null || n.isRead === undefined,
    ).length;
  }, [allNotifications]);

  // Safely extract unread count from API response (supporting object, number, or fallback)
  const apiUnread = useMemo(() => {
    if (typeof unreadCountData === "number") return unreadCountData;
    if (unreadCountData && typeof unreadCountData === "object") {
      if (typeof unreadCountData.totalUnreadCount === "number") {
        return unreadCountData.totalUnreadCount;
      }
      const raw = unreadCountData as Record<string, unknown>;
      if (typeof raw.count === "number") return raw.count;
      if (typeof raw.unreadCount === "number") return raw.unreadCount;
      if (typeof raw.totalUnread === "number") return raw.totalUnread;
      if (typeof raw.total === "number") return raw.total;
      if (
        typeof raw.personalUnreadCount === "number" ||
        typeof raw.groupUnreadCount === "number"
      ) {
        return (
          (Number(raw.personalUnreadCount) || 0) +
          (Number(raw.groupUnreadCount) || 0)
        );
      }
    }
    return 0;
  }, [unreadCountData]);

  const totalUnread = Math.max(apiUnread, unreadFromList);

  const handleClickOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    markAsRead();
  };

  const handleOpenItemMenu = (
    event: React.MouseEvent<HTMLElement>,
    notificationId: string,
  ) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setTargetNotificationId(notificationId);
  };

  const handleCloseItemMenu = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setMenuAnchorEl(null);
    setTargetNotificationId(null);
  };

  const handleDeletePersonalItem = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (targetNotificationId) {
      deletePersonal(targetNotificationId);
    }
    handleCloseItemMenu();
  };

  const handleItemClick = (notification: NotificationResponse) => {
    // If notification is unread, mark as read
    if (!notification.isRead) {
      markAsRead({ id: notification.id, category: notification.category });
    }

    // Category = GROUP: Open detail modal
    if (notification.category === "GROUP") {
      setSelectedNotification(notification);
      setDetailOpen(true);
      return;
    }

    // Category = PERSONAL (or non-group): Build link based on user roles and redirect
    handleClosePopover();
    const targetLink = buildNotificationLink(notification, roles);
    if (targetLink.startsWith("http://") || targetLink.startsWith("https://")) {
      window.location.href = targetLink;
    } else {
      router.push(targetLink);
    }
  };

  return (
    <>
      <Tooltip title="Notifications" arrow>
        <IconButton onClick={handleClickOpen} sx={{ color: "#475569" }}>
          <Badge
            badgeContent={totalUnread}
            color="error"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                fontWeight: 700,
                fontSize: "0.7rem",
                minWidth: 18,
                height: 18,
                px: 0.5,
              },
            }}
          >
            <Bell size={20} />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Notification Dropdown Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: { xs: 340, sm: 420 },
              maxHeight: 560,
              borderRadius: 1,
              boxShadow: "0 16px 40px rgba(15, 23, 42, 0.12)",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Dropdown Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            bgcolor: "#ffffff",
            borderBottom: "1px solid rgba(15, 23, 42, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: "#0f172a" }}
            >
              Notifications
            </Typography>
            {totalUnread > 0 && (
              <Chip
                label={`${totalUnread} new`}
                size="small"
                color="error"
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
              />
            )}
          </Box>

          {totalUnread > 0 && (
            <Button
              onClick={handleMarkAllRead}
              disabled={isMarkingRead}
              size="small"
              startIcon={<CheckCheck size={14} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                color: "#2563eb",
                "&:hover": { bgcolor: "rgba(37, 99, 235, 0.06)" },
              }}
            >
              Mark all read
            </Button>
          )}
        </Box>

        {/* Notification List Body */}
        <Box
          sx={{ flex: 1, overflowY: "auto", minHeight: 260, maxHeight: 400 }}
        >
          {isNotificationsLoading ? (
            <Box
              sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}
            >
              {[1, 2, 3, 4].map((idx) => (
                <Box
                  key={idx}
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                >
                  <Skeleton variant="circular" width={36} height={36} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="60%" height={16} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : allNotifications.length === 0 ? (
            <EmptyState
              title="No Notifications"
              subtitle="You have caught up with all your notifications."
              icon={<BellOff size={24} />}
            />
          ) : (
            <List disablePadding>
              {allNotifications.map((notification) => {
                const isGroup = notification.category === "GROUP";
                const isUnread =
                  notification.isRead === false ||
                  notification.isRead === null ||
                  notification.isRead === undefined;
                const iconStyle = getNotificationIconAndStyle(notification);

                return (
                  <Box key={notification.id}>
                    <ListItemButton
                      onClick={() => handleItemClick(notification)}
                      sx={{
                        py: 1.75,
                        px: 2.5,
                        bgcolor: isUnread
                          ? "rgba(37, 99, 235, 0.04)"
                          : "transparent",
                        transition: "bgcolor 0.15s ease",
                        alignItems: "flex-start",
                        gap: 1.5,
                        "&:hover": {
                          bgcolor: isUnread
                            ? "rgba(37, 99, 235, 0.08)"
                            : "rgba(15, 23, 42, 0.03)",
                        },
                      }}
                    >
                      {/* Avatar / Icon */}
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: iconStyle.bgcolor,
                          color: iconStyle.color,
                          flexShrink: 0,
                          mt: 0.25,
                        }}
                      >
                        {iconStyle.icon}
                      </Box>

                      {/* Content Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: isUnread ? 800 : 600,
                              color: isUnread ? "#0f172a" : "#334155",
                              fontSize: "0.875rem",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {notification.title}
                          </Typography>
                          {isUnread && (
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                bgcolor: "#2563eb",
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </Box>

                        {notification.content && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                              lineHeight: 1.4,
                              mt: 0.5,
                            }}
                          >
                            {stripHtmlTags(notification.content)}
                          </Typography>
                        )}

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mt: 0.75,
                          }}
                        >
                          <Chip
                            label={notification.category}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: "0.625rem",
                              fontWeight: 700,
                              bgcolor: isGroup ? "#fef3c7" : "#dbeafe",
                              color: isGroup ? "#b45309" : "#1e40af",
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontSize: "0.725rem",
                            }}
                          >
                            {formatServerDate(
                              notification.createdAt,
                              "datetime",
                            )}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Action Menu Trigger for Personal Notifications */}
                      {!isGroup && (
                        <IconButton
                          size="small"
                          onClick={(e) =>
                            handleOpenItemMenu(e, notification.id)
                          }
                          sx={{
                            color: "#64748b",
                            p: 0.5,
                            mt: 0.25,
                            "&:hover": {
                              bgcolor: "rgba(15, 23, 42, 0.06)",
                              color: "#0f172a",
                            },
                          }}
                        >
                          <MoreVertical size={16} />
                        </IconButton>
                      )}
                    </ListItemButton>
                    <Divider sx={{ opacity: 0.5 }} />
                  </Box>
                );
              })}
            </List>
          )}
        </Box>

        {/* Dropdown Footer: Only show "View More" if there are remaining notifications to load */}
        {hasNextPage && (
          <Box
            sx={{
              p: 1.5,
              bgcolor: "#f8fafc",
              borderTop: "1px solid rgba(15, 23, 42, 0.06)",
              textAlign: "center",
            }}
          >
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.825rem",
                color: "#2563eb",
                "&:hover": { bgcolor: "rgba(37, 99, 235, 0.06)" },
              }}
            >
              {isFetchingNextPage ? (
                <CircularProgress size={16} sx={{ mr: 1 }} />
              ) : (
                "View More"
              )}
            </Button>
          </Box>
        )}
      </Popover>

      {/* Item Action Menu for PERSONAL notifications */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={(e: React.MouseEvent) => handleCloseItemMenu(e)}
        onClick={(e) => e.stopPropagation()}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 1.5,
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
              minWidth: 120,
            },
          },
        }}
      >
        <MenuItem
          onClick={handleDeletePersonalItem}
          disabled={isDeletingPersonal}
          sx={{ color: "error.main", fontSize: "0.85rem", gap: 1 }}
        >
          <ListItemIcon
            sx={{ minWidth: "auto !important", color: "error.main" }}
          >
            <Trash2 size={16} />
          </ListItemIcon>
          <ListItemText
            primary="Delete"
            sx={{
              "& .MuiListItemText-primary": {
                fontSize: "0.85rem",
                fontWeight: 600,
              },
            }}
          />
        </MenuItem>
      </Menu>

      {/* Notification Detail Dialog */}
      <NotificationDetailDialog
        open={detailOpen}
        notification={selectedNotification}
        onClose={() => setDetailOpen(false)}
      />
    </>
  );
}
