"use client";

import ButtonAction from "@/components/common/button-action";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/filter-select";
import { InfoDialog } from "@/components/common/info-dialog";
import { deletePostVersion, getPostVersionsByPostId } from "@/lib/api/forum";
import { PostStatus } from "@/lib/api/types";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { formatServerDate } from "@/lib/util/date-utils";
import { Box, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { Calendar, Eye, FileText, History, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface PostHistoryModalProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  mode?: "normal" | "manage";
  isMine?: boolean;
}

const STATUS_OPTIONS = [
  { id: "PENDING", title: "Pending" },
  { id: "APPROVED", title: "Approved" },
  { id: "REJECTED", title: "Rejected" },
  { id: "SUPERSEDED", title: "Superseded" },
];

const getStatusColor = (status: PostStatus | string) => {
  switch (status) {
    case "APPROVED":
      return "success";
    case "PENDING":
      return "warning";
    case "REJECTED":
      return "error";
    case "SUPERSEDED":
      return "default";
    default:
      return "default";
  }
};

export function PostHistoryModal({
  open,
  onClose,
  postId,
  mode = "normal",
  isMine = false,
}: PostHistoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [selectedVersion, setSelectedVersion] = useState<any>(null);
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);

  const { handleError, showSuccess } = useApiWithToast();

  const lastFetchParams = useRef({ postId: "", filterStatus: "" });

  const fetchHistory = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const apiStatus =
        mode === "normal"
          ? "APPROVED"
          : filterStatus === "ALL"
            ? undefined
            : filterStatus;
      const response: any = await getPostVersionsByPostId(postId, apiStatus);
      setVersions(
        Array.isArray(response) ? response : response?.contents || [],
      );
    } catch (err) {
      setError(err as Error);
      handleError(err, "Failed to fetch post history");
    } finally {
      setLoading(false);
    }
  }, [postId, mode, filterStatus, handleError]);

  useEffect(() => {
    if (open) {
      const currentParams = { postId, filterStatus };
      // Only fetch if parameters have changed
      if (
        lastFetchParams.current.postId !== currentParams.postId ||
        lastFetchParams.current.filterStatus !== currentParams.filterStatus
      ) {
        fetchHistory();
        lastFetchParams.current = currentParams;
      }
    }
  }, [open, postId, filterStatus, fetchHistory]);

  const handleDelete = async () => {
    if (!versionToDelete) return;
    try {
      await deletePostVersion(versionToDelete);
      showSuccess("Post version deleted successfully");
      setVersions((prev) => prev.filter((v) => v.id !== versionToDelete));
    } catch (err) {
      handleError(err, "Failed to delete version");
    } finally {
      setVersionToDelete(null);
    }
  };

  return (
    <>
      <InfoDialog
        open={open && !selectedVersion}
        onClose={onClose}
        title={
          <Box component="span">
            Post history{" "}
            {mode === "manage" && (
              <Box
                component="span"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  fontSize: "1rem",
                }}
              >
                (Manage)
              </Box>
            )}
          </Box>
        }
        headerIcon={<History size={24} />}
        maxWidth="md"
        paperSx={{
          height: "75vh",
          maxHeight: 800,
        }}
      >
        {mode === "manage" && (
          <Box sx={{ mb: -1 }}>
            <FilterSelect
              label="Filter by Status"
              value={filterStatus}
              onChange={setFilterStatus}
              items={STATUS_OPTIONS}
              defaultLabel="All Statuses"
              defaultValue="ALL"
            />
          </Box>
        )}

        {loading ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            {[1, 2, 3].map((i) => (
              <Box
                key={i}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Skeleton width="40%" height={24} sx={{ mb: 1.5 }} />
                <Skeleton width="100%" height={20} />
                <Skeleton width="80%" height={20} />
              </Box>
            ))}
          </Stack>
        ) : error ? (
          <ErrorState title="Failed to load history" onRetry={fetchHistory} />
        ) : versions.length === 0 ? (
          <EmptyState title="No post history data" />
        ) : (
          <PostVersionList
            versions={versions}
            mode={mode}
            isMine={isMine}
            onViewVersion={setSelectedVersion}
            onDeleteVersion={setVersionToDelete}
          />
        )}
      </InfoDialog>

      {/* Version Detail Dialog */}
      <InfoDialog
        open={!!selectedVersion}
        onClose={() => setSelectedVersion(null)}
        title="Version Detail"
        headerIcon={<FileText size={24} />}
        maxWidth="md"
        paperSx={{
          height: "75vh",
          maxHeight: 800,
        }}
      >
        {selectedVersion && (
          <>
            {/* HERO HEADER */}
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                p: 3,
                mb: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                background: (theme) =>
                  theme.palette.mode === "dark"
                    ? "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))"
                    : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
              }}
            >
              {/* top glow */}
              <Box
                sx={{
                  position: "absolute",
                  top: -120,
                  right: -120,
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  background: "primary.main",
                  opacity: 0.06,
                  filter: "blur(60px)",
                  pointerEvents: "none",
                }}
              />

              {/* META */}
              <Stack
                direction="row"
                spacing={1.25}
                sx={{
                  mb: 2,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: 0.3,
                    boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                  }}
                >
                  VERSION DETAIL
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.5,
                    py: 0.7,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Calendar size={15} />

                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    {formatServerDate(
                      selectedVersion.createdAt || selectedVersion.updatedAt,
                    )}
                  </Typography>
                </Box>

                {mode === "manage" && selectedVersion.status && (
                  <Chip
                    label={selectedVersion.status}
                    size="small"
                    color={getStatusColor(selectedVersion.status) as any}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      height: 30,
                      "& .MuiChip-label": {
                        px: 1.5,
                      },
                    }}
                  />
                )}
              </Stack>

              {/* TITLE */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                  letterSpacing: -1,
                  mb: 2,
                  color: "text.primary",
                }}
              >
                {selectedVersion.title}
              </Typography>

              {/* DESCRIPTION */}
              {selectedVersion.shortDescription && (
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.9,
                    fontSize: "1.02rem",
                    maxWidth: 900,
                  }}
                >
                  {selectedVersion.shortDescription}
                </Typography>
              )}
            </Box>

            {/* CONTENT */}
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 1,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
              }}
            >
              {/* top accent */}
              <Box
                sx={{
                  height: 4,
                  background:
                    "linear-gradient(90deg, rgba(25,118,210,1) 0%, rgba(99,102,241,1) 100%)",
                }}
              />

              <Box
                sx={{
                  p: {
                    xs: 2.5,
                    md: 4,
                  },

                  color: "text.primary",
                  lineHeight: 1.9,
                  fontSize: "1rem",

                  "& h1, & h2, & h3": {
                    fontWeight: 800,
                    lineHeight: 1.3,
                    mt: 4,
                    mb: 2,
                    color: "text.primary",
                    letterSpacing: -0.5,
                  },

                  "& p": {
                    mb: 2,
                    color: "text.secondary",
                  },

                  "& img": {
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: 3,
                    my: 3,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  },

                  "& pre": {
                    overflowX: "auto",
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "grey.950",
                    fontSize: "0.9rem",
                    my: 2,
                  },

                  "& code": {
                    fontFamily: "monospace",
                  },

                  "& blockquote": {
                    borderLeft: "4px solid",
                    borderColor: "primary.main",
                    pl: 2,
                    ml: 0,
                    my: 3,
                    color: "text.secondary",
                    fontStyle: "italic",
                    opacity: 0.9,
                  },

                  "& ul, & ol": {
                    pl: 3,
                    mb: 2,
                  },

                  "& li": {
                    mb: 1,
                  },

                  "& a": {
                    color: "primary.main",
                    textDecoration: "none",
                    fontWeight: 600,

                    "&:hover": {
                      textDecoration: "underline",
                    },
                  },
                }}
                dangerouslySetInnerHTML={{
                  __html: selectedVersion.content || "N/A",
                }}
              />
            </Box>
          </>
        )}
      </InfoDialog>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={!!versionToDelete}
        title="Delete Version"
        description="Are you sure you want to delete this post version? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setVersionToDelete(null)}
      />
    </>
  );
}

interface PostVersionListProps {
  versions: any[];
  mode: "normal" | "manage";
  isMine: boolean;
  onViewVersion: (version: any) => void;
  onDeleteVersion: (versionId: string) => void;
}

function PostVersionList({
  versions,
  mode,
  isMine,
  onViewVersion,
  onDeleteVersion,
}: PostVersionListProps) {
  return (
    <Stack spacing={2.25}>
      {versions.map((version, index) => {
        const versionNumber = versions.length - index;

        return (
          <Box
            key={version.id || index}
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              transition: "all .28s cubic-bezier(0.4, 0, 0.2, 1)",
              backdropFilter: "blur(10px)",

              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor:
                  version.status === "APPROVED"
                    ? "success.main"
                    : version.status === "REJECTED"
                      ? "error.main"
                      : "warning.main",
                transition: "all .25s ease",
              },

              "&:hover": {
                transform: "translateY(-4px)",
                borderColor: "primary.main",
                boxShadow:
                  "0 12px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",

                "& .version-actions": {
                  opacity: 1,
                  transform: "translateX(0)",
                },

                "&::before": {
                  width: 6,
                },
              },
            }}
          >
            <Box
              sx={{
                p: 2.5,
                pl: 3,
              }}
            >
              {/* HEADER */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  mb: 2,
                }}
              >
                {/* LEFT */}
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    spacing={1.25}
                    sx={{ alignItems: "center" }}
                  >
                    <Box
                      sx={{
                        px: 1.4,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        color: "primary.contrastText",
                        fontWeight: 700,
                        fontSize: 13,
                        letterSpacing: 0.3,
                        boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                      }}
                    >
                      v{versionNumber}
                    </Box>

                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        color: "text.primary",
                        letterSpacing: -0.2,
                      }}
                    >
                      {version.title || `Post Version ${versionNumber}`}
                    </Typography>

                    {mode === "manage" && version.status && (
                      <Chip
                        label={version.status}
                        size="small"
                        color={getStatusColor(version.status) as any}
                        sx={{
                          fontWeight: 700,
                          borderRadius: 2,
                          height: 26,
                          "& .MuiChip-label": {
                            px: 1.2,
                          },
                        }}
                      />
                    )}
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: "center" }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    >
                      {formatServerDate(version.createdAt || version.updatedAt)}
                    </Typography>
                  </Stack>
                </Stack>

                {/* ACTIONS */}
                <Stack
                  direction="row"
                  spacing={1}
                  className="version-actions"
                  sx={{
                    opacity: 0,
                    transform: "translateX(8px)",
                    transition: "all .25s ease",
                  }}
                >
                  <ButtonAction
                    icon={<Eye size={18} />}
                    tooltip="View details"
                    variant="soft"
                    color="primary"
                    onClick={() => onViewVersion(version)}
                  />

                  {mode === "manage" &&
                    isMine &&
                    version.status === "PENDING" && (
                      <ButtonAction
                        icon={<Trash2 size={18} />}
                        tooltip="Delete version"
                        variant="soft"
                        color="error"
                        onClick={() => onDeleteVersion(version.id)}
                      />
                    )}
                </Stack>
              </Box>

              {/* CONTENT */}
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 1,
                  px: 2,
                  py: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.03)"
                      : "grey.50",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    lineHeight: 1.75,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",

                    "& p": {
                      m: 0,
                    },

                    "& img": {
                      display: "none",
                    },
                  }}
                  dangerouslySetInnerHTML={{
                    __html:
                      version.content ||
                      version.shortDescription ||
                      version.title ||
                      "N/A",
                  }}
                />

                {/* fade */}
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 40,
                    background:
                      "linear-gradient(to bottom, transparent, background.paper)",
                    pointerEvents: "none",
                  }}
                />
              </Box>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
