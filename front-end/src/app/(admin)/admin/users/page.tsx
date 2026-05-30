"use client";

import ButtonAction from "@/components/common/button-action";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { HeroInfo } from "@/components/common/hero-info";
import { UserFormDialog } from "@/components/dialog/user-form/page";
import type { RoleEnum, UserResponse } from "@/lib/api/types";
import { useSearchUsersQuery } from "@/lib/api/users";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Button, CircularProgress, Stack } from "@mui/material";
import { ChevronDown, RefreshCw, UserPlus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { UserSearchSection } from "./user-search-section";
import { UserTable } from "./user-table";

export default function AdminUsersPage() {
  const { handleError } = useApiWithToast();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [page, setPage] = useState(0);

  // Active filters in use for the loaded results
  const [activeKeyword, setActiveKeyword] = useState("");
  const [activeRole, setActiveRole] = useState<RoleEnum>("STUDENT");

  // Form dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  // React Query Hook
  const {
    data: usersData,
    isLoading: loading,
    isFetching: loadingMore,
    error,
    refetch,
  } = useSearchUsersQuery(page, activeKeyword, activeRole);

  const totalPages = usersData?.totalPages ?? 0;
  const isError = Boolean(error);

  // Append new data when usersData is loaded
  useEffect(() => {
    if (usersData) {
      if (page === 0) {
        setUsers(usersData.contents);
      } else {
        setUsers((prev) => [...prev, ...usersData.contents]);
      }
    }
  }, [usersData, page]);

  useEffect(() => {
    if (error) {
      handleError(error, "Failed to load users");
    }
  }, [error, handleError]);

  const handleSearch = (newKeyword: string, newRole: RoleEnum) => {
    setActiveKeyword(newKeyword);
    setActiveRole(newRole);
    setPage(0);
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages - 1) return;
    setPage((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setPage(0);
    refetch();
  };

  const handleUserSaved = () => {
    setPage(0);
    refetch();
  };

  const hasNextPage = page < totalPages - 1;

  return (
    <Stack spacing={4} sx={{ width: "100%", pb: 5 }}>
      {/* Hero Section */}
      <HeroInfo
        title="User Management"
        description="Comprehensive dashboard for monitoring and managing the entire user base. Search for members, assign access roles, and securely onboard new students, lecturers, or administrators into the platform."
        icon={<UserPlus size={24} className="text-blue-400" />}
        tags={["Search Users", "Add Users", "Manage Roles"]}
      />

      {/* Search & Actions Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
        }}
      >
        <Box sx={{ width: "100%", flexGrow: 1, maxWidth: 800 }}>
          <UserSearchSection
            onSearch={handleSearch}
            initialRole={activeRole}
            loading={loading || loadingMore}
          />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          <ButtonAction
            tooltip="Refresh data"
            variant="soft"
            color="info"
            onClick={handleRefresh}
            icon={<RefreshCw size={21} strokeWidth={2.3} />}
          />
          <ButtonAction
            tooltip="Add user"
            onClick={() => setDialogOpen(true)}
            icon={<UserPlus size={21} strokeWidth={2.3} />}
          />
        </Box>
      </Box>

      {/* Main Table Content */}

      <Box>
        <Stack spacing={3}>
          {/* Table */}
          <UserTable
            users={users}
            loading={loading || loadingMore}
            errorState={
              isError ? (
                <ErrorState
                  title="Failed to load users"
                  subtitle="Failed to load users. Please try again later."
                  onRetry={handleRefresh}
                />
              ) : undefined
            }
            emptyState={
              <EmptyState
                title={
                  Boolean(activeKeyword) ? "No users found" : "No users found"
                }
                subtitle={
                  Boolean(activeKeyword)
                    ? "Try searching with a different keyword or adjust the role selection in the filter."
                    : "The system doesn't have any accounts of this role yet. You can create a new user now."
                }
                icon={<Users size={32} />}
                actionLabel={
                  !Boolean(activeKeyword) ? "Add first user" : undefined
                }
                onAction={
                  !Boolean(activeKeyword)
                    ? () => setDialogOpen(true)
                    : undefined
                }
              />
            }
          />

          {/* Pagination / Load More actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              mt: 1,
            }}
          >
            {hasNextPage && (
              <Button
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loadingMore || loading}
                startIcon={
                  loadingMore ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <ChevronDown size={18} />
                  )
                }
                sx={{
                  borderRadius: 2.5,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </Button>
            )}
          </Box>
        </Stack>
      </Box>

      {/* User Form Dialog */}
      <UserFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSaved={handleUserSaved}
      />
    </Stack>
  );
}
