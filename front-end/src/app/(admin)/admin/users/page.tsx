"use client";

import ButtonAction from "@/components/common/button-action";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { HeroInfo } from "@/components/common/hero-info";
import { UserFormDialog } from "@/components/dialog/user-form/page";
import type { RoleEnum, UserResponse } from "@/lib/api/types";
import { searchUsers } from "@/lib/api/users";
import { useApiWithToast } from "@/lib/use-api-with-toast";
import { Box, Button, CircularProgress, Stack } from "@mui/material";
import { ChevronDown, RefreshCw, UserPlus, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { UserSearchSection } from "./user-search-section";
import { UserTable } from "./user-table";

export default function AdminUsersPage() {
  const { handleError } = useApiWithToast();

  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isError, setIsError] = useState(false);

  // Active filters in use for the loaded results
  const [activeKeyword, setActiveKeyword] = useState("");
  const [activeRole, setActiveRole] = useState<RoleEnum>("STUDENT");

  // Form dialog state
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchUsers = useCallback(
    async (
      pageNum: number,
      keyword: string,
      role: RoleEnum,
      isAppend: boolean,
    ) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await searchUsers(pageNum, keyword, role);
        if (isAppend) {
          setUsers((prev) => [...prev, ...response.contents]);
        } else {
          setUsers(response.contents);
        }
        setPage(response.currentPage);
        setTotalPages(response.totalPages);
        setIsError(false);
      } catch (err) {
        handleError(err, "Không thể tải danh sách người dùng");
        setIsError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [handleError],
  );

  // Initial load
  useEffect(() => {
    fetchUsers(0, "", "STUDENT", false);
  }, [fetchUsers]);

  const handleSearch = (newKeyword: string, newRole: RoleEnum) => {
    setActiveKeyword(newKeyword);
    setActiveRole(newRole);
    fetchUsers(0, newKeyword, newRole, false);
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || page >= totalPages - 1) return;
    fetchUsers(page + 1, activeKeyword, activeRole, true);
  };

  const handleRefresh = () => {
    fetchUsers(0, activeKeyword, activeRole, false);
  };

  const handleUserSaved = () => {
    fetchUsers(0, activeKeyword, activeRole, false);
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
            tooltip="Tải lại dữ liệu"
            variant="soft"
            color="info"
            onClick={handleRefresh}
            icon={<RefreshCw size={21} strokeWidth={2.3} />}
          />
          <ButtonAction
            tooltip="Thêm người dùng"
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
                  title="Lỗi tải dữ liệu"
                  subtitle="Không thể tải danh sách người dùng. Vui lòng thử lại sau."
                  onRetry={handleRefresh}
                />
              ) : undefined
            }
            emptyState={
              <EmptyState
                title={
                  Boolean(activeKeyword)
                    ? "Không tìm thấy người dùng"
                    : "Chưa có người dùng nào"
                }
                subtitle={
                  Boolean(activeKeyword)
                    ? "Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh lựa chọn vai trò trong bộ lọc."
                    : "Hệ thống chưa có tài khoản nào thuộc vai trò này. Bạn có thể tạo người dùng mới ngay bây giờ."
                }
                icon={<Users size={32} />}
                actionLabel={
                  !Boolean(activeKeyword)
                    ? "Thêm người dùng đầu tiên"
                    : undefined
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
                {loadingMore ? "Đang tải..." : "Tải thêm kết quả"}
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
