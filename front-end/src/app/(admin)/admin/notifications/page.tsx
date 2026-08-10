"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { HeroInfo } from "@/components/common/hero-section/hero-info";
import { NotificationDetailDialog } from "@/components/dialog/notification/notification-detail";
import { CreateGroupNotificationDialog } from "@/components/dialog/notification/notification-form";
import {
  useAllGroupNotificationsInfiniteQuery,
  useCreateGroupNotificationMutation,
  useDeleteGroupNotificationMutation,
} from "@/lib/api/notification";
import { useToast } from "@/lib/toast-context";
import type {
  CreateGroupNotificationRequest,
  NotificationResponse,
} from "@/lib/type/notification";
import { formatServerDate } from "@/lib/util/date-utils";
import { stripHtmlTags } from "@/lib/util/text-utils";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItemButton,
  Paper,
  Skeleton,
  Typography,
} from "@mui/material";
import {
  Bell,
  BellPlus,
  Clock,
  Eye,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function AdminNotificationsPage() {
  const toast = useToast();

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState<boolean>(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationResponse | null>(null);

  // Deletion Confirm Dialog State
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // --- API React Query Hooks ---
  // All Group Notifications (Admin Announcements)
  const {
    data: groupNotificationsData,
    isLoading: isGroupLoading,
    isError: isGroupError,
    refetch: refetchGroup,
    hasNextPage: hasNextGroupPage,
    fetchNextPage: fetchNextGroupPage,
    isFetchingNextPage: isFetchingNextGroupPage,
  } = useAllGroupNotificationsInfiniteQuery();

  // Mutations
  const { mutateAsync: createGroupNotification, isPending: isCreating } =
    useCreateGroupNotificationMutation();

  const { mutateAsync: deleteGroupNotification, isPending: isDeleting } =
    useDeleteGroupNotificationMutation();

  // Flattened group notifications list
  const groupNotificationsList = useMemo(() => {
    if (!groupNotificationsData?.pages) return [];
    return groupNotificationsData.pages.flatMap((page) => page.contents || []);
  }, [groupNotificationsData]);

  // Handle create group notification submission
  const handleSaveGroupNotification = async (
    request: CreateGroupNotificationRequest,
  ) => {
    try {
      await createGroupNotification(request);
      toast.success("Group announcement dispatched successfully!");
      setCreateDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to dispatch group announcement",
      );
    }
  };

  // Handle confirm group notification deletion
  const handleConfirmDeleteGroupNotification = async () => {
    if (!deleteId) return;
    try {
      await deleteGroupNotification(deleteId);
      toast.success("Group announcement deleted successfully!");
      setDeleteId(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete group announcement",
      );
    }
  };

  const handleOpenDetail = (notification: NotificationResponse) => {
    setSelectedNotification(notification);
    setDetailDialogOpen(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 4,
        width: "100%",
        pb: 5,
      }}
    >
      {/* Hero Section */}
      <HeroInfo
        title="Group Notifications Management"
        description="Centralized dashboard for creating, broadcasting, and managing group announcements distributed to Students, Lecturers, and Admins across the platform."
        icon={<Bell size={24} className="text-blue-400" />}
        tags={["Group Announcements", "System Broadcasts"]}
      />

      {/* Main Group Notifications Table / List */}
      <Paper
        variant="outlined"
        sx={{
          borderRadius: 1,
          borderColor: "rgba(15, 23, 42, 0.08)",
          boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.03)",
          overflow: "hidden",
        }}
      >
        {/* Header Toolbar */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: "1px solid rgba(15, 23, 42, 0.08)",
            bgcolor: "#ffffff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, color: "#0f172a" }}
          >
            Dispatched Announcements
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <ButtonAction
              tooltip="Create Announcement"
              icon={<BellPlus size={20} />}
              onClick={() => setCreateDialogOpen(true)}
              variant="contained"
              color="primary"
            />
          </Box>
        </Box>

        {/* Content Body */}
        <Box>
          {isGroupLoading ? (
            <Box
              sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
            >
              {[1, 2, 3, 4, 5].map((key) => (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    p: 2.5,
                    borderRadius: 2,
                    border: "1px solid rgba(15, 23, 42, 0.06)",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Skeleton
                    variant="rounded"
                    width={44}
                    height={44}
                    sx={{ borderRadius: 2.5, flexShrink: 0 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        mb: 1,
                      }}
                    >
                      <Skeleton variant="text" width="35%" height={24} />
                      <Skeleton
                        variant="rounded"
                        width={80}
                        height={20}
                        sx={{ borderRadius: 1 }}
                      />
                    </Box>
                    <Skeleton
                      variant="text"
                      width="85%"
                      height={18}
                      sx={{ mb: 0.5 }}
                    />
                    <Skeleton
                      variant="text"
                      width="60%"
                      height={18}
                      sx={{ mb: 1.5 }}
                    />
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Skeleton variant="text" width={120} height={16} />
                      <Skeleton variant="text" width={140} height={16} />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Skeleton variant="circular" width={34} height={34} />
                    <Skeleton variant="circular" width={34} height={34} />
                  </Box>
                </Box>
              ))}
            </Box>
          ) : isGroupError ? (
            <Box sx={{ p: 4 }}>
              <ErrorState
                title="Failed to load group announcements"
                onRetry={() => {
                  void refetchGroup();
                }}
              />
            </Box>
          ) : groupNotificationsList.length === 0 ? (
            <Box sx={{ p: 4 }}>
              <EmptyState
                title="No Group Announcements Found"
                subtitle="There are no system or group notifications dispatched yet. Click 'Create Announcement' above to dispatch a new notification."
              />
            </Box>
          ) : (
            <List disablePadding>
              {groupNotificationsList.map((announcement) => (
                <Box key={announcement.id}>
                  <ListItemButton
                    onClick={() => handleOpenDetail(announcement)}
                    sx={{
                      py: 2.5,
                      px: 3,
                      transition: "bgcolor 0.15s ease",
                      "&:hover": { bgcolor: "rgba(15, 23, 42, 0.02)" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", md: "center" },
                        gap: 2,
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                          flex: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            bgcolor: "rgba(245, 158, 11, 0.12)",
                            color: "#d97706",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <Users size={22} />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 700, color: "#0f172a" }}
                            >
                              {announcement.title}
                            </Typography>
                            <Chip
                              label={announcement.type || "ANNOUNCEMENT"}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: "0.7rem",
                                fontWeight: 700,
                                bgcolor: "#fef3c7",
                                color: "#b45309",
                              }}
                            />
                          </Box>

                          {announcement.content && (
                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                mt: 0.5,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {stripHtmlTags(announcement.content)}
                            </Typography>
                          )}

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mt: 1.5,
                              flexWrap: "wrap",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Clock size={14} className="text-slate-400" />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 500,
                                }}
                              >
                                {formatServerDate(
                                  announcement.createdAt,
                                  "datetime",
                                )}
                              </Typography>
                            </Box>

                            {announcement.targetRoles &&
                              announcement.targetRoles.length > 0 && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Shield
                                    size={14}
                                    className="text-slate-400"
                                  />
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "text.secondary",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Roles: {announcement.targetRoles.join(", ")}
                                  </Typography>
                                </Box>
                              )}

                            {announcement.createdBy && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 500,
                                }}
                              >
                                By: {announcement.createdBy}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ButtonAction
                          tooltip="View Details"
                          icon={<Eye size={18} />}
                          onClick={() => handleOpenDetail(announcement)}
                          variant="soft"
                          color="primary"
                        />

                        <ButtonAction
                          tooltip="Delete Announcement"
                          icon={<Trash2 size={18} />}
                          onClick={() => setDeleteId(announcement.id)}
                          variant="soft"
                          color="error"
                        />
                      </Box>
                    </Box>
                  </ListItemButton>
                </Box>
              ))}

              {hasNextGroupPage && (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Button
                    onClick={() => fetchNextGroupPage()}
                    disabled={isFetchingNextGroupPage}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      fontWeight: 700,
                      textTransform: "none",
                    }}
                  >
                    {isFetchingNextGroupPage ? (
                      <CircularProgress size={18} sx={{ mr: 1 }} />
                    ) : (
                      "Load More Announcements"
                    )}
                  </Button>
                </Box>
              )}
            </List>
          )}
        </Box>
      </Paper>

      {/* Create Group Announcement Modal */}
      <CreateGroupNotificationDialog
        open={createDialogOpen}
        saving={isCreating}
        onClose={() => setCreateDialogOpen(false)}
        onSave={handleSaveGroupNotification}
      />

      {/* Notification Detail Modal */}
      <NotificationDetailDialog
        open={detailDialogOpen}
        notification={selectedNotification}
        onClose={() => setDetailDialogOpen(false)}
      />

      {/* Delete Group Announcement Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete Group Announcement"
        description="Are you sure you want to soft delete this group announcement? This action will remove it from future distribution."
        confirmLabel="Delete Announcement"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleConfirmDeleteGroupNotification}
        onCancel={() => setDeleteId(null)}
      />
    </Box>
  );
}
