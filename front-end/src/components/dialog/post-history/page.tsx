"use client";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/form/filter-select";
import { InfoDialog } from "@/components/common/info-dialog";
import {
  useDeletePostVersionMutation,
  usePostVersionsByPostIdQuery,
} from "@/lib/api/forum";
import type { PostResponse } from "@/lib/type/forums";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Skeleton, Stack } from "@mui/material";
import { History } from "lucide-react";
import { useEffect, useState } from "react";
import { PostVersionList } from "./post-version-list";
import { POST_STATUS_OPTIONS } from "../../../lib/util/status-utils";
import { VersionDetailDialog } from "./version-detail-dialog";

interface PostHistoryModalProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  mode?: "normal" | "manage";
  isMine?: boolean;
}

export function PostHistoryModal({
  open,
  onClose,
  postId,
  mode = "normal",
  isMine = false,
}: PostHistoryModalProps) {
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [selectedVersion, setSelectedVersion] = useState<PostResponse | null>(
    null,
  );
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);

  const { handleError, showSuccess } = useApiWithToast();

  const apiStatus =
    mode === "normal"
      ? "APPROVED"
      : filterStatus === "ALL"
        ? undefined
        : filterStatus;

  // React Query Hooks
  const {
    data: versions = [],
    isLoading: loading,
    error,
    refetch: fetchHistory,
  } = usePostVersionsByPostIdQuery(postId, apiStatus, {
    enabled: open && !!postId,
  });

  const { mutateAsync: deletePostVersionMutate } =
    useDeletePostVersionMutation();

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to fetch post history");
    }
  }, [error, handleError]);

  const handleDelete = async () => {
    if (!versionToDelete) return;
    try {
      await deletePostVersionMutate(versionToDelete);
      showSuccess("Post version deleted successfully");
      fetchHistory();
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
          height: { xs: "85vh", sm: "75vh" },
          maxHeight: 800,
        }}
      >
        {mode === "manage" && (
          <Box sx={{ mb: { xs: 1, sm: 0 } }}>
            <FilterSelect
              label="Filter by Status"
              value={filterStatus}
              onChange={setFilterStatus}
              items={POST_STATUS_OPTIONS}
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
      <VersionDetailDialog
        open={!!selectedVersion}
        onClose={() => setSelectedVersion(null)}
        selectedVersion={selectedVersion}
        mode={mode}
      />

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
